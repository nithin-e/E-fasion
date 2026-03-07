import axios from './axios';

// Auth API calls
export const registerApi = (data: { name: string; email: string; mobile: string; password: string }) =>
  axios.post('/auth/register', data);

export const verifyOtpApi = (email: string, code: string) =>
  axios.post('/auth/verify-otp', { email, code });

export const loginApi = (email: string, password: string) =>
  axios.post('/auth/login', { email, password });

export const logoutApi = () =>
  axios.post('/auth/logout');

export const googleSignInApi = (idToken: string) =>
  axios.post('/auth/google', { idToken });
