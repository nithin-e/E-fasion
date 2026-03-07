import { Schema, model } from 'mongoose';
import { IOtp } from '../types';

const otpSchema = new Schema<IOtp>({
  email: { type: String, required: true, lowercase: true, trim: true },
  otp: { type: String, required: true },
  expiresAt: { type: Date, required: true, index: { expires: 0 } }, // TTL index auto-removes
  createdAt: { type: Date, default: Date.now },
});

otpSchema.index({ email: 1 });

export const Otp = model<IOtp>('Otp', otpSchema);
