// Centralized TypeScript types for the Suruchi Fashion API

export interface User {
  _id: string;
  name: string;
  email: string;
  mobile: string;
  gender?: 'Male' | 'Female' | 'Other';
  role: 'user' | 'admin';
  is_verified: boolean;
  is_blocked: boolean;
  createdAt: string;
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
  size: string;
  price: number;
  stock: number;
  images: string[];
  is_deleted: boolean;
}

export interface Product {
  _id: string;
  name: string;
  description: string;
  categoryId: Category;
  brand: string;
  highlights: string[];
  basePrice: number;
  is_deleted: boolean;
  variants?: Variant[];
  ratings?: {
    average: number;
    count: number;
  };
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

export interface ApiResponse<T = unknown> {
  success: boolean;
  message: string;
  data?: T;
}
