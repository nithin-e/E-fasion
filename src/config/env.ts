import dotenv from 'dotenv';
dotenv.config();

const required = (key: string): string => {
  const val = process.env[key];
  if (!val) throw new Error(`Missing required env variable: ${key}`);
  return val;
};

// Optional helper — returns empty string if not set
const optional = (key: string): string => process.env[key] || '';

export const env = {
  NODE_ENV: process.env.NODE_ENV || 'development',
  PORT: parseInt(process.env.PORT || '3000', 10),
  MONGO_URI: required('MONGO_URI'),
  JWT_SECRET: required('JWT_SECRET'),
  JWT_EXPIRES_IN: process.env.JWT_EXPIRES_IN || '7d',
  CLIENT_URL: process.env.CLIENT_URL || 'http://localhost:5173',

  // Email
  EMAIL_HOST: process.env.EMAIL_HOST || 'smtp.gmail.com',
  EMAIL_PORT: parseInt(process.env.EMAIL_PORT || '587', 10),
  EMAIL_USER: required('EMAIL_USER'),
  EMAIL_PASS: required('EMAIL_PASS'),

  // Razorpay
  RAZORPAY_KEY_ID: required('RAZORPAY_KEY_ID'),
  RAZORPAY_KEY_SECRET: required('RAZORPAY_KEY_SECRET'),

  // Cloudinary
  CLOUDINARY_CLOUD_NAME: process.env.CLOUDINARY_CLOUD_NAME || '',
  CLOUDINARY_API_KEY: process.env.CLOUDINARY_API_KEY || '',
  CLOUDINARY_API_SECRET: process.env.CLOUDINARY_API_SECRET || '',

  // Google OAuth
  GOOGLE_CLIENT_ID: optional('GOOGLE_CLIENT_ID'),

  // Geo
  WAREHOUSE_LAT: parseFloat(process.env.WAREHOUSE_LAT || '28.7041'),
  WAREHOUSE_LNG: parseFloat(process.env.WAREHOUSE_LNG || '77.1025'),
  DELIVERY_RADIUS_KM: parseFloat(process.env.DELIVERY_RADIUS_KM || '20'),
} as const;
