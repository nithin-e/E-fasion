import { Types } from 'mongoose';
import { Cart } from '../models/cartModel';
import { Variant } from '../models/variantModel';
import { Coupon } from '../models/couponModel';
import { AppError } from '../middlewares/errorMiddleware';
import { HTTP } from '../utils/statuscodes';

export const getCart = async (userId: Types.ObjectId) => {
  return Cart.findOne({ userId })
    .populate({ path: 'items.productId', select: 'name brand basePrice is_deleted' })
    .populate({ path: 'items.variantId', select: 'price discountPrice stock size shadeName images' })
    .lean();
};

export const addToCart = async (
  userId: Types.ObjectId,
  productId: string,
  variantId: string,
  quantity = 1
) => {
  const variant = await Variant.findOne({ _id: variantId, productId, is_deleted: false });
  if (!variant) throw new AppError('Product variant not found', HTTP.NOT_FOUND);
  if (variant.stock < quantity) throw new AppError('Insufficient stock', HTTP.BAD_REQUEST);

  let cart = await Cart.findOne({ userId });
  if (!cart) cart = new Cart({ userId, items: [] });

  const existingIdx = cart.items.findIndex(
    (i) => i.variantId.toString() === variantId
  );

  if (existingIdx >= 0) {
    const newQty = cart.items[existingIdx].quantity + quantity;
    if (newQty > variant.stock) throw new AppError('Not enough stock', HTTP.BAD_REQUEST);
    cart.items[existingIdx].quantity = newQty;
  } else {
    cart.items.push({
      productId: new Types.ObjectId(productId),
      variantId: new Types.ObjectId(variantId),
      quantity,
    });
  }

  await cart.save();
  return getCart(userId);
};

export const updateCartQty = async (
  userId: Types.ObjectId,
  variantId: string,
  quantity: number
) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new AppError('Cart not found', HTTP.NOT_FOUND);

  const item = cart.items.find((i) => i.variantId.toString() === variantId);
  if (!item) throw new AppError('Item not in cart', HTTP.NOT_FOUND);

  const variant = await Variant.findById(variantId);
  if (variant && quantity > variant.stock) throw new AppError('Insufficient stock', HTTP.BAD_REQUEST);

  item.quantity = quantity;
  await cart.save();
  return getCart(userId);
};

export const removeFromCart = async (userId: Types.ObjectId, variantId: string) => {
  const cart = await Cart.findOne({ userId });
  if (!cart) throw new AppError('Cart not found', HTTP.NOT_FOUND);
  cart.items = cart.items.filter((i) => i.variantId.toString() !== variantId);
  await cart.save();
  return getCart(userId);
};

export const applyCoupon = async (userId: Types.ObjectId, code: string) => {
  const coupon = await Coupon.findOne({ code: code.toUpperCase(), is_active: true });
  if (!coupon) throw new AppError('Invalid or expired coupon', HTTP.BAD_REQUEST);
  if (coupon.expiresAt < new Date()) throw new AppError('Coupon has expired', HTTP.BAD_REQUEST);
  if (coupon.usedCount >= coupon.maxRedeemable) throw new AppError('Coupon usage limit reached', HTTP.BAD_REQUEST);

  const cart = await Cart.findOne({ userId }).populate('items.variantId', 'price');
  if (!cart || cart.items.length === 0) throw new AppError('Cart is empty', HTTP.BAD_REQUEST);

  const subTotal = cart.items.reduce((acc, item) => {
    const price = (item.variantId as any)?.price || 0;
    return acc + price * item.quantity;
  }, 0);

  if (subTotal < coupon.minPurchase) {
    throw new AppError(`Minimum purchase of ₹${coupon.minPurchase} required`, HTTP.BAD_REQUEST);
  }

  const discount = (subTotal * coupon.discount) / 100;
  cart.couponCode = coupon.code;
  cart.discount = Math.round(discount);
  await cart.save();

  return { discount: cart.discount, couponCode: cart.couponCode };
};
