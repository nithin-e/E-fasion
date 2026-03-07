import { Schema, model, Types } from 'mongoose';
import slugify from 'slugify';
import { IProduct } from '../types';

const productSchema = new Schema<IProduct>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    brand: { type: Schema.Types.ObjectId, ref: 'Brand', required: true, index: true },
    description: { type: String, required: true },
    highlights: [{ type: String }],
    category: { type: Schema.Types.ObjectId, ref: 'Category', required: true, index: true },
    basePrice: { type: Number, required: true, min: 0 },
    variants: [{ type: Schema.Types.ObjectId, ref: 'Variant' }],
    avgRating: { type: Number, default: 0, min: 0, max: 5 },
    numReviews: { type: Number, default: 0 },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

// Auto-slug
productSchema.pre('save', function (next) {
  if (this.isModified('name')) {
    this.slug = slugify(this.name + '-' + (this._id as Types.ObjectId).toString().slice(-4), { lower: true, strict: true });
  }
  next();
});

// Text search indexes
productSchema.index({ name: 'text', brand: 'text', description: 'text' });
productSchema.index({ category: 1, is_deleted: 1 });

export const Product = model<IProduct>('Product', productSchema);
