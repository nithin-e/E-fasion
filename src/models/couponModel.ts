import { Schema, model } from 'mongoose';
import { ICoupon } from '../types';

const couponSchema = new Schema<ICoupon>(
  {
    code: { type: String, required: true, unique: true, uppercase: true, trim: true },
    discount: { type: Number, required: true, min: 1, max: 100 },
    minPurchase: { type: Number, required: true, min: 0, default: 0 },
    maxRedeemable: { type: Number, required: true, min: 1 },
    usedCount: { type: Number, default: 0 },
    expiresAt: { type: Date, required: true },
    is_active: { type: Boolean, default: true },
  },
  { timestamps: true }
);

couponSchema.index({ code: 1 });

export const Coupon = model<ICoupon>('Coupon', couponSchema);
