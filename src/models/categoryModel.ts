import { Schema, model } from 'mongoose';
import slugify from 'slugify';
import { ICategory } from '../types';

const categorySchema = new Schema<ICategory>(
  {
    name: { type: String, required: true, unique: true, trim: true },
    slug: { type: String, unique: true },
    image: { type: String, default: '' },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-generate slug before save
categorySchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name, { lower: true, strict: true });
  }
  next();
});

export const Category = model<ICategory>('Category', categorySchema);
