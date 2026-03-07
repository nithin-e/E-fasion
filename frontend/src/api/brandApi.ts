import axios from './axios';

export const getBrandsApi = () => axios.get('/brands');
export const createBrandApi = (data: any) => axios.post('/brands', data);
export const updateBrandApi = (id: string, data: any) => axios.patch(`/brands/${id}`, data);
export const deleteBrandApi = (id: string) => axios.delete(`/brands/${id}`);
