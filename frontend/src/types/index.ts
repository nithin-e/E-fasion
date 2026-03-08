// Centralized TypeScript types for the Suruchi Fashion API

export interface SavedCard {
  _id?: string;
  cardType: string;
  cardNumber: string; // Masked e.g. **** **** **** 1234
  nameOnCard?: string;
  cardName?: string; // Sometimes used as alias
  expiry: string;
}

export interface SavedUPI {
  _id?: string;
  upiId: string;
  appName: string;
}

export interface SavedWallet {
  _id?: string;
  walletName: string;
  linkedNumber: string;
}

export interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  gender?: 'Male' | 'Female' | 'Other';
  birthday?: string | Date;
  alternateMobile?: string;
  mynCash?: number;
  savedCards?: SavedCard[];
  savedUPI?: SavedUPI[];
  savedWallets?: SavedWallet[];
  role: 'user' | 'admin';
  is_verified: boolean;
  is_blocked: boolean;
  is_profile_complete: boolean;
  wallet: number;
  createdAt: string;
  updatedAt: string;
}

export interface Address {
  _id: string;
  userId: string;
  fullName: string;
  mobile: string;
  pincode: string;
  houseName: string;
  locality: string;
  city: string;
  state: string;
  isDefault: boolean;
  location: { type: 'Point'; coordinates: [number, number] };
}

export interface Category {
  _id: string;
  name: string;
  description?: string;
  image: string;
  is_deleted: boolean;
}

export interface Variant {
  _id: string;
  productId: string;
  shadeName?: string;
  shadeHex?: string;
  size: string;
  price: number;
  discountPrice?: number;
  stock: number;
  images: string[];
  is_deleted: boolean;
}

export interface Brand {
  _id: string;
  name: string;
  slug: string;
  logo: string;
  description?: string;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  categoryId: Category;
  brand: string | Brand;
  highlights: string[];
  basePrice: number;
  avgRating?: number;
  numReviews?: number;
  is_deleted: boolean;
  variants?: Variant[];
  createdAt: string;
  updatedAt: string;
}

export interface CartItem {
  productId: Product;
  variantId: Variant;
  quantity: number;
}

export interface OrderProduct {
  productId: string | Product;
  variantId: string | Variant;
  quantity: number;
  priceAtPurchase: number;
}

export interface Order {
  _id: string;
  userId: string;
  shippingAddress: Address;
  products: OrderProduct[];
  subTotal: number;
  deliveryCharge: number;
  grandTotal: number;
  paymentMethod: 'onlinepay' | 'cod';
  paymentStatus: 'pending' | 'paid' | 'failed' | 'refunded';
  orderStatus: 'pending' | 'processing' | 'dispatched' | 'delivered' | 'cancelled' | 'returned';
  razorpayOrderId?: string;
  razorpayPaymentId?: string;
  deliveryAgentLocation?: { coordinates: [number, number] };
  createdAt: string;
}

export interface Coupon {
  _id: string;
  code: string;
  discount: number;
  minPurchase: number;
  maxRedeemable: number;
  expiresAt: string;
  is_active: boolean;
}

export interface Banner {
  _id: string;
  image: string;
  link: string;
  title?: string;
  description?: string;
  isActive: boolean;
  priority: number;
}

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
