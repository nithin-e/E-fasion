import { Schema, model } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUser } from '../types';

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true, minlength: 2, maxlength: 60 },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    mobile: { type: String, required: true, unique: true, match: /^[0-9]{10}$/ },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    is_verified: { type: Boolean, default: false },
    is_blocked: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
    wishlist: [{ type: Schema.Types.ObjectId, ref: 'Product' }],
    fcmToken: { type: String },
  },
  { timestamps: true }
);

// Hash password before save
userSchema.pre('save', async function (next) {
  if (!this.isModified('password')) return next();
  this.password = await bcrypt.hash(this.password, 12);
  next();
});

// Compare password method
userSchema.methods.comparePassword = async function (candidate: string): Promise<boolean> {
  return bcrypt.compare(candidate, this.password);
};

// Soft-delete filter
userSchema.pre(/^find/, function (this: any, next) {
  this.find({ is_deleted: { $ne: true } });
  next();
});

export const User = model<IUser>('User', userSchema);
