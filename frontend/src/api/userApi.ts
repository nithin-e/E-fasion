import api from './axios';

export const getAddressesApi = () => api.get('/addresses');

export const addAddressApi = (data: object) => api.post('/addresses', data);

export const deleteAddressApi = (id: string) => api.delete(`/addresses/${id}`);

// Cart
export const getCartApi = () => api.get('/cart');

export const addToCartApi = (data: { productId: string; variantId: string; quantity: number }) =>
  api.post('/cart', data);

export const removeFromCartApi = (variantId: string) =>
  api.delete(`/cart/${variantId}`);

export const updateCartQtyApi = (variantId: string, quantity: number) =>
  api.patch(`/cart/${variantId}`, { quantity });

// Wishlist
export const getWishlistApi = () => api.get('/wishlist');

export const addToWishlistApi = (productId: string) =>
  api.post('/wishlist', { productId });

export const removeFromWishlistApi = (productId: string) =>
  api.delete(`/wishlist/${productId}`);

// Admin
export const getCustomersApi = (params?: Record<string, string>) =>
  api.get('/admin/customers', { params });

export const blockUserApi = (id: string, blocked: boolean) =>
  api.patch(`/admin/customers/${id}/block`, { is_blocked: blocked });

export const getDashboardStatsApi = () => api.get('/admin/dashboard');

export const getSalesReportApi = (params?: Record<string, string>) =>
  api.get('/admin/sales', { params });

export const getCouponsApi = () => api.get('/admin/coupons');

export const addCouponApi = (data: object) => api.post('/admin/coupons', data);

export const deleteCouponApi = (id: string) => api.delete(`/admin/coupons/${id}`);
