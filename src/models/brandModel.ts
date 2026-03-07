import { Schema, model } from 'mongoose';
import slugify from 'slugify';
import { IBrand } from '../types';

const brandSchema = new Schema<IBrand>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
    logo: { type: String, required: true },
    description: { type: String },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

brandSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export const Brand = model<IBrand>('Brand', brandSchema);
