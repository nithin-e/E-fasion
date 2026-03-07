import { Schema, model } from 'mongoose';
import { IVariant } from '../types';

const variantSchema = new Schema<IVariant>(
  {
    productId: { type: Schema.Types.ObjectId, ref: 'Product', required: true, index: true },
    size: { type: String, required: true, trim: true },
    shadeName: { type: String, trim: true },
    shadeHex: { type: String },
    price: { type: Number, required: true, min: 0 },
    discountPrice: { type: Number, min: 0 },
    stock: { type: Number, required: true, min: 0, default: 0 },
    images: [{ type: String }],
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Variant = model<IVariant>('Variant', variantSchema);
