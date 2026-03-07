import { Schema, model } from 'mongoose';
import { IOrder } from '../types';

const orderProductSchema = new Schema(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true },
    variantId: { type: Schema.Types.ObjectId, ref: 'Variant', required: true },
    quantity: { type: Number, required: true, min: 1 },
    priceAtPurchase: { type: Number, required: true },
  },
  { _id: false }
);

const shippingAddressSchema = new Schema(
  {
    fullName: String,
    mobile: String,
    houseName: String,
    locality: String,
    city: String,
    state: String,
    pincode: String,
  },
  { _id: false }
);

const orderSchema = new Schema<IOrder>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    products: { type: [orderProductSchema], required: true },
    shippingAddress: { type: shippingAddressSchema, required: true },
    paymentMethod: { type: String, enum: ['onlinepay', 'cod'], required: true },
    paymentStatus: { type: String, enum: ['pending', 'paid', 'failed', 'refunded'], default: 'pending' },
    razorpayOrderId: { type: String },
    razorpayPaymentId: { type: String },
    orderStatus: {
      type: String,
      enum: ['pending', 'processing', 'dispatched', 'delivered', 'cancelled', 'returned'],
      default: 'pending',
    },
    subTotal: { type: Number, required: true },
    deliveryCharge: { type: Number, default: 0 },
    discount: { type: Number, default: 0 },
    grandTotal: { type: Number, required: true },
    couponCode: { type: String },
    deliveryAgentId: { type: Schema.Types.ObjectId, ref: 'User' },
    deliveryAgentLocation: {
      type: { type: String, enum: ['Point'], default: 'Point' },
      coordinates: { type: [Number], default: [0, 0] },
    },
  },
  { timestamps: true }
);

orderSchema.index({ orderStatus: 1 });
orderSchema.index({ deliveryAgentLocation: '2dsphere' });

export const Order = model<IOrder>('Order', orderSchema);
