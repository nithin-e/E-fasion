import api from './axios';

export const getProductsApi = (params: {
  q?: string;
  category?: string;
  brand?: string | string[];
  minPrice?: number;
  maxPrice?: number;
  color?: string | string[];
  discount?: number;
  rating?: number;
  sort?: string;
  page?: number;
  limit?: number;
}) =>
  api.get('/products', { params });

export const getProductByIdApi = (id: string) =>
  api.get(`/products/${id}`);

export const getCategoriesApi = () =>
  api.get('/categories');

export const searchProductsApi = (query: string) =>
  api.get('/products/search', { params: { q: query } });

export const getBannersApi = () =>
  api.get('/banners');

export const getBrandsApi = () =>
  api.get('/brands');

// Admin product management
export const addProductApi = (data: object) =>
  api.post('/admin/products', data);

export const editProductApi = (id: string, data: object) =>
  api.put(`/admin/products/${id}`, data);

export const deleteProductApi = (id: string) =>
  api.delete(`/admin/products/${id}`);

export const addCategoryApi = (formData: FormData) =>
  api.post('/admin/categories', formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const editCategoryApi = (id: string, data: object) =>
  api.put(`/admin/categories/${id}`, data);

export const deleteCategoryApi = (id: string) =>
  api.delete(`/admin/categories/${id}`);

export const addVariantApi = (productId: string, formData: FormData) =>
  api.post(`/admin/products/${productId}/variants`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const editVariantApi = (id: string, formData: FormData) =>
  api.put(`/admin/variants/${id}`, formData, { headers: { 'Content-Type': 'multipart/form-data' } });

export const deleteVariantApi = (id: string) =>
  api.delete(`/admin/variants/${id}`);
