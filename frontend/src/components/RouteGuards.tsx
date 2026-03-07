import React from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

// Blocks unauthenticated users from protected routes
export const ProtectedRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="page-loader"><div className="spinner" /></div>;
  return user ? <Outlet /> : <Navigate to="/login" replace />;
};

// Blocks non-admin users from admin routes
export const AdminRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="page-loader"><div className="spinner" /></div>;
  if (!user) return <Navigate to="/login" replace />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
};

// Blocks authenticated users from reaching login/register pages
export const GuestRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="page-loader"><div className="spinner" /></div>;
  return !user ? <Outlet /> : <Navigate to="/" replace />;
};
