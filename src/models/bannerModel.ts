import { Schema, model } from 'mongoose';
import { IBanner } from '../types';

const bannerSchema = new Schema<IBanner>(
  {
    image: { type: String, required: true },
    link: { type: String, required: true },
    title: { type: String },
    description: { type: String },
    isActive: { type: Boolean, default: true },
    priority: { type: Number, default: 0 },
  },
  { timestamps: true }
);

export const Banner = model<IBanner>('Banner', bannerSchema);
