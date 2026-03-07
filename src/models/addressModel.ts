import { Schema, model } from 'mongoose';
import { IAddress } from '../types';

const addressSchema = new Schema<IAddress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', required: true, index: true },
    fullName: { type: String, required: true, trim: true },
    mobile: { type: String, required: true, match: /^[0-9]{10}$/ },
    houseName: { type: String, required: true, trim: true },
    locality: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    state: { type: String, required: true, trim: true },
    pincode: { type: String, required: true, match: /^[0-9]{6}$/ },
    lat: { type: Number, required: true },
    lng: { type: Number, required: true },
    isDefault: { type: Boolean, default: false },
    is_deleted: { type: Boolean, default: false },
  },
  { timestamps: true }
);

export const Address = model<IAddress>('Address', addressSchema);
