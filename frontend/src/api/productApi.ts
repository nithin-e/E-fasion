import api from './axios';

export const getProductsApi = (params?: Record<string, string | number>) =>
  api.get('/products', { params });

export const getProductByIdApi = (id: string) =>
  api.get(`/products/${id}`);

export const getCategoriesApi = () =>
  api.get('/categories');

export const searchProductsApi = (query: string) =>
  api.get('/products/search', { params: { q: query } });

// Admin product management
export const addProductApi = (formData: FormData) =>
  api.post('/admin/products', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const editProductApi = (id: string, data: object) =>
  api.put(`/admin/products/${id}`, data);

export const deleteProductApi = (id: string) =>
  api.delete(`/admin/products/${id}`);

export const addCategoryApi = (formData: FormData) =>
  api.post('/admin/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const editCategoryApi = (id: string, data: object) =>
  api.put(`/admin/categories/${id}`, data);
