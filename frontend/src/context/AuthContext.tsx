import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';
import { loginApi, logoutApi } from '../api/authApi';
import api from '../api/axios';

interface AuthContextType {
  user: User | null;
  token: string | null;
  isLoading: boolean;
  login: (email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  setUser: (user: User | null) => void;
  setToken: (token: string | null) => void;
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

  const login = async (email: string, password: string) => {
    const res = await loginApi(email, password);
    const { token: newToken, user: loggedInUser } = res.data;
    localStorage.setItem('authToken', newToken);
    setToken(newToken);
    setUser(loggedInUser);
  };

  const logout = async () => {
    await logoutApi();
    localStorage.removeItem('authToken');
    setToken(null);
    setUser(null);
  };

  // Expose setToken so Google OAuth can persist JWT directly
  const persistToken = (t: string | null) => {
    if (t) localStorage.setItem('authToken', t);
    else localStorage.removeItem('authToken');
    setToken(t);
  };

  return (
    <AuthContext.Provider value={{ user, token, isLoading, login, logout, setUser, setToken: persistToken }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
};
