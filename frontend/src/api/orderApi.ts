import api from './axios';

export const getMyOrdersApi = () => api.get('/orders/my-orders');

export const getOrderByIdApi = (id: string) => api.get(`/orders/${id}`);

export const checkoutApi = (data: {
  addressId: string;
  paymentMethod: 'onlinepay' | 'cod';
  products: { productId: string; variantId: string; quantity: number }[];
}) => api.post('/orders/checkout', data);

export const verifyPaymentApi = (data: {
  razorpayOrderId: string;
  razorpayPaymentId: string;
  razorpaySignature: string;
}) => api.post('/orders/verify-payment', data);

export const cancelOrderApi = (id: string) =>
  api.patch(`/orders/${id}/cancel`);

// Admin
export const getAllOrdersApi = (params?: Record<string, string>) =>
  api.get('/admin/orders', { params });

export const updateOrderStatusApi = (id: string, status: string) =>
  api.patch(`/admin/orders/${id}/status`, { status });
