import crypto from 'crypto';
import Razorpay from 'razorpay';
import { Types } from 'mongoose';
import { Order } from '../models/orderModel';
import { Address } from '../models/addressModel';
import { Variant } from '../models/variantModel';
import { Cart } from '../models/cartModel';
import { env } from '../config/env';
import { AppError } from '../middlewares/errorMiddleware';
import { HTTP } from '../utils/statuscodes';
import { sendOrderConfirmationEmail } from '../utils/emailService';
import { User } from '../models/userModel';

const razorpay = new Razorpay({
  key_id: env.RAZORPAY_KEY_ID,
  key_secret: env.RAZORPAY_KEY_SECRET,
});

export const createOrder = async (
  userId: Types.ObjectId,
  addressId: string,
  paymentMethod: 'onlinepay' | 'cod'
) => {
  // 1. Validate address belongs to user
  const address = await Address.findOne({ _id: addressId, userId, is_deleted: false });
  if (!address) throw new AppError('Address not found', HTTP.NOT_FOUND);

  // 2. Get user's cart
  const cart = await Cart.findOne({ userId }).populate('items.variantId');
  if (!cart || cart.items.length === 0) throw new AppError('Cart is empty', HTTP.BAD_REQUEST);

  // 3. Server-side price calculation
  const products: Array<{ productId: Types.ObjectId; variantId: Types.ObjectId; quantity: number; priceAtPurchase: number }> = [];
  let subTotal = 0;

  for (const item of cart.items) {
    const variant = await Variant.findById(item.variantId);
    if (!variant || variant.is_deleted) throw new AppError('A product is no longer available', HTTP.BAD_REQUEST);
    if (variant.stock < item.quantity) throw new AppError(`Insufficient stock for ${variant.size}`, HTTP.BAD_REQUEST);

    const price = variant.discountPrice || variant.price;
    subTotal += price * item.quantity;
    products.push({
      productId: item.productId as Types.ObjectId,
      variantId: variant._id,
      quantity: item.quantity,
      priceAtPurchase: price,
    });
  }

  const deliveryCharge = subTotal > 5000 ? 0 : 50;
  const discount = cart.discount || 0;
  const grandTotal = subTotal + deliveryCharge - discount;

  const shippingAddress = {
    fullName: address.fullName,
    mobile: address.mobile,
    houseName: address.houseName,
    locality: address.locality,
    city: address.city,
    state: address.state,
    pincode: address.pincode,
  };

  // 4. Create the order
  const order = await Order.create({
    userId,
    products,
    shippingAddress,
    paymentMethod,
    paymentStatus: paymentMethod === 'cod' ? 'pending' : 'pending',
    orderStatus: paymentMethod === 'cod' ? 'processing' : 'pending',
    subTotal,
    deliveryCharge,
    discount,
    grandTotal,
    couponCode: cart.couponCode,
  });

  // 5. If online payment, create Razorpay order
  let razorpayOrderId: string | undefined;
  if (paymentMethod === 'onlinepay') {
    const rzOrder = await razorpay.orders.create({
      amount: grandTotal * 100, // paise
      currency: 'INR',
      receipt: order._id.toString(),
    });
    order.razorpayOrderId = rzOrder.id;
    await order.save();
    razorpayOrderId = rzOrder.id;
  }

  // 6. Deduct stock
  for (const item of products) {
    await Variant.findByIdAndUpdate(item.variantId, { $inc: { stock: -item.quantity } });
  }

  // 7. Clear cart
  cart.items = [];
  cart.couponCode = undefined;
  cart.discount = 0;
  await cart.save();

  // 8. Send confirmation email (non-blocking)
  const user = await User.findById(userId).select('email');
  if (user && paymentMethod === 'cod') {
    sendOrderConfirmationEmail(user.email, order._id.toString(), grandTotal).catch(() => {});
  }

  return { orderId: order._id, razorpayOrderId, amount: grandTotal * 100 };
};

export const verifyRazorpayPayment = async (data: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) => {
  const expected = crypto
    .createHmac('sha256', env.RAZORPAY_KEY_SECRET)
    .update(`${data.razorpayOrderId}|${data.razorpayPaymentId}`)
    .digest('hex');

  if (expected !== data.razorpaySignature) {
    throw new AppError('Payment verification failed', HTTP.BAD_REQUEST);
  }

  const order = await Order.findOne({ razorpayOrderId: data.razorpayOrderId });
  if (!order) throw new AppError('Order not found', HTTP.NOT_FOUND);

  order.razorpayPaymentId = data.razorpayPaymentId;
  order.paymentStatus = 'paid';
  order.orderStatus = 'processing';
  await order.save();

  // Send confirmation email
  const user = await User.findById(order.userId).select('email');
  if (user) {
    sendOrderConfirmationEmail(user.email, order._id.toString(), order.grandTotal).catch(() => {});
  }

  return order;
};
