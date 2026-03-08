import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { sendOtpApi, verifyOtpApi, completeSignupApi, logoutApi } from '../api/authApi';
import api from '../api/axios';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  sendOtp: (mobile: string) => Promise<any>;
  verifyOtp: (mobile: string, code: string) => Promise<{ isNewUser: boolean }>;
  completeSignup: (name: string, email: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
  refetchUser: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [token, setToken] = useState<string | null>(localStorage.getItem('authToken'));
  const [isLoading, setIsLoading] = useState(true);

  const fetchProfile = useCallback(async () => {
    try {
      const res = await api.get('/users/profile');
      setUser(res.data.user);
    } catch {
      setUser(null);
      setToken(null);
      localStorage.removeItem('authToken');
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    if (token) {
      fetchProfile();
    } else {
      setIsLoading(false);
    }
  }, [token, fetchProfile]);

  const sendOtp = async (mobile: string) => {
    const res = await sendOtpApi(mobile);
    return res.data;
  };

  const verifyOtp = async (mobile: string, code: string) => {
    const res = await verifyOtpApi(mobile, code);
    const { token: newToken, user: loggedInUser, isNewUser } = res.data;
    
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setUser(loggedInUser);
    
    return { isNewUser };
  };

  const completeSignup = async (name: string, email: string) => {
    const res = await completeSignupApi({ name, email });
    setUser(res.data.user);
  };

  const logout = async () => {
    try {
      await logoutApi();
    } catch (err) {
      console.error('Logout error:', err);
    } finally {
      localStorage.removeItem('authToken');
      setToken(null);
      setUser(null);
    }
  };

  // Expose setToken so Google OAuth can persist JWT directly
  const persistToken = (t: string | null) => {
    if (t) localStorage.setItem('authToken', t);
    else localStorage.removeItem('authToken');
    setToken(t);
  };

  return (
    <AuthContext.Provider value={{ 
      user, token, isLoading, 
      sendOtp, verifyOtp, completeSignup, logout, 
      setUser, setToken: persistToken,
      refetchUser: fetchProfile
    }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
