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

// Blocks authenticated users from reaching login/register pages (unless profile is incomplete)
export const GuestRoute: React.FC = () => {
  const { user, isLoading } = useAuth();
  if (isLoading) return <div className="page-loader"><div className="spinner" /></div>;
  
  // If user exists and profile is complete, redirect to home
  if (user && user.is_profile_complete) {
    return <Navigate to="/" replace />;
  }
  
  // Otherwise (no user OR incomplete profile), allow access to login/register/UnifiedAuth
  return <Outlet />;
};
