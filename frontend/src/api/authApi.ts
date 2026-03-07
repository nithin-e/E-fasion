import axios from './axios';

// Auth API calls
export const sendOtpApi = (mobile: string) =>
  axios.post('/auth/send-otp', { mobile });

export const verifyOtpApi = (mobile: string, code: string) =>
  axios.post('/auth/verify-otp', { mobile, code });

export const completeSignupApi = (data: { name: string; email: string }) =>
  axios.post('/auth/complete-signup', data);

export const logoutApi = () =>
  axios.post('/auth/logout');

export const googleSignInApi = (idToken: string) =>
  axios.post('/auth/google', { idToken });
