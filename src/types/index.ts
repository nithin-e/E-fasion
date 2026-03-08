import mongoose, { Document, Types } from 'mongoose';

// ─── User ─────────────────────────────────────────────────────────────────────
export interface ISavedCard {
  _id?: Types.ObjectId;
  cardNumber: string; // Stored as masked string (e.g., **** 1234)
  cardName: string;
  expiry: string;
  cardType: string;   // Visa, Mastercard, etc.
}

export interface ISavedUPI {
  _id?: Types.ObjectId;
  upiId: string;
  appName?: string;
}

export interface ISavedWallet {
  _id?: Types.ObjectId;
  walletName: string;
  linkedNumber: string;
}

export interface IUser extends Document {
  _id: Types.ObjectId;
  name: string;
  email: string;
  mobile: string;
  alternateMobile?: string;
  gender?: 'Male' | 'Female';
  birthday?: Date;
  password: string;
  role: 'user' | 'admin';
  is_verified: boolean;
  is_blocked: boolean;
  is_deleted: boolean;
  wishlist: Types.ObjectId[];
  wallet: number;                 // Added wallet balance
  mynCash: number;                // Myntra Cash feature
  savedCards: ISavedCard[];
  savedUPI: ISavedUPI[];
  savedWallets: ISavedWallet[];
  fcmToken?: string;
  is_profile_complete: boolean;   // To track if new user filled details
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidate: string): Promise<boolean>;
}

// ─── OTP ──────────────────────────────────────────────────────────────────────
export interface IOtp extends Document {
  email: string;
  otp: string;
  expiresAt: Date;
  createdAt: Date;
}

// ─── Address ──────────────────────────────────────────────────────────────────
export interface IAddress extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  fullName: string;
  mobile: string;
  houseName: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
  lat: number;
  lng: number;
  isDefault: boolean;
  is_deleted: boolean;
}

// ─── Category ─────────────────────────────────────────────────────────────────
export interface ICategory extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  image: string;
  is_deleted: boolean;
}

// ─── Variant ──────────────────────────────────────────────────────────────────
export interface IVariant extends Document {
  _id: Types.ObjectId;
  productId: Types.ObjectId;
  size: string;
  shadeName?: string;
  shadeHex?: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  is_deleted: boolean;
}

// ─── Product ──────────────────────────────────────────────────────────────────
export interface IProduct extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  brand: Types.ObjectId | IBrand;  // Changed to Ref
  description: string;
  highlights: string[];
  category: Types.ObjectId | ICategory;
  basePrice: number;
  variants: IVariant[];
  avgRating: number;               // Added for rating system
  numReviews: number;              // Added for rating system
  is_deleted: boolean;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Cart ─────────────────────────────────────────────────────────────────────
export interface ICartItem {
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  quantity: number;
}

export interface ICart extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId;
  items: ICartItem[];
  couponCode?: string;
  discount: number;
  updatedAt: Date;
}

// ─── Coupon ───────────────────────────────────────────────────────────────────
export interface ICoupon extends Document {
  _id: Types.ObjectId;
  code: string;
  discount: number;             // Percentage
  minPurchase: number;
  maxRedeemable: number;
  usedCount: number;
  expiresAt: Date;
  is_active: boolean;
}

// ─── Order ────────────────────────────────────────────────────────────────────
export type OrderStatus = 'pending' | 'processing' | 'dispatched' | 'delivered' | 'cancelled' | 'returned';
export type PaymentStatus = 'pending' | 'paid' | 'failed' | 'refunded';
export type PaymentMethod = 'onlinepay' | 'cod';

export interface IOrderProduct {
  productId: Types.ObjectId;
  variantId: Types.ObjectId;
  quantity: number;
  priceAtPurchase: number;
}

export interface IShippingAddress {
  fullName: string;
  mobile: string;
  houseName: string;
  locality: string;
  city: string;
  state: string;
  pincode: string;
}

export interface IOrder extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId | IUser;
  products: IOrderProduct[];
  shippingAddress: IShippingAddress;
  paymentMethod: PaymentMethod;
  paymentStatus: PaymentStatus;
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  orderStatus: OrderStatus;
  subTotal: number;
  deliveryCharge: number;
  discount: number;
  grandTotal: number;
  deliveryAgentId?: Types.ObjectId;
  deliveryAgentLocation?: {
    type: 'Point';
    coordinates: [number, number]; // [lng, lat]
  };
  couponCode?: string;
  createdAt: Date;
  updatedAt: Date;
}

// ─── Brand ────────────────────────────────────────────────────────────────────
export interface IBrand extends Document {
  _id: Types.ObjectId;
  name: string;
  slug: string;
  logo: string;
  description?: string;
  is_deleted: boolean;
}

// ─── Review ───────────────────────────────────────────────────────────────────
export interface IReview extends Document {
  _id: Types.ObjectId;
  userId: Types.ObjectId | IUser;
  productId: Types.ObjectId | IProduct;
  rating: number;                // 1-5
  comment: string;
  is_deleted: boolean;
  createdAt: Date;
}

// ─── Banner ───────────────────────────────────────────────────────────────────
export interface IBanner extends Document {
  _id: Types.ObjectId;
  image: string;
  link: string;                  // URL or Category/Product slug
  title?: string;
  description?: string;
  isActive: boolean;
  priority: number;              // For sorting
}
