import React, { lazy, Suspense } from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { ProtectedRoute, AdminRoute, GuestRoute } from './components/RouteGuards';
import UserLayout from './components/Layout/UserLayout';
import AdminLayout from './components/Layout/AdminLayout';
import ToastManager from './components/ui/ToastManager';
import './styles/globals.css';

// === Lazy loaded pages ===
// Auth
const UnifiedAuth    = lazy(() => import('./pages/auth/UnifiedAuth'));

// User
const HomePage          = lazy(() => import('./pages/user/HomePage'));
const ShopPage          = lazy(() => import('./pages/user/ShopPage'));
const ProductDetailPage = lazy(() => import('./pages/user/ProductDetailPage'));
const WishlistPage      = lazy(() => import('./pages/user/WishlistPage'));
const CartPage          = lazy(() => import('./pages/user/CartPage'));
const CheckoutPage      = lazy(() => import('./pages/user/CheckoutPage'));
const ProfilePage       = lazy(() => import('./pages/user/ProfilePage'));
const OrdersPage        = lazy(() => import('./pages/user/OrdersPage'));
const OrderDetailPage   = lazy(() => import('./pages/user/OrderDetailPage'));
const OrderSuccessPage  = lazy(() => import('./pages/user/OrderSuccessPage'));

// Admin
const AdminDashboard  = lazy(() => import('./pages/admin/AdminDashboard'));
const AdminProducts   = lazy(() => import('./pages/admin/AdminProducts'));
const AdminProductForm = lazy(() => import('./pages/admin/AdminProductForm'));
const AdminCategories  = lazy(() => import('./pages/admin/AdminCategories'));
const AdminOrders     = lazy(() => import('./pages/admin/AdminOrders'));
const AdminCustomers  = lazy(() => import('./pages/admin/AdminCustomers'));
const AdminCoupons    = lazy(() => import('./pages/admin/AdminCoupons'));
const AdminBrands     = lazy(() => import('./pages/admin/AdminBrands'));
const AdminBanners    = lazy(() => import('./pages/admin/AdminBanners'));

const PageLoader = () => (
  <div className="page-loader"><div className="spinner" /></div>
);

const App: React.FC = () => {
  return (
    <BrowserRouter>
      <AuthProvider>
        <CartProvider>
          <ToastManager />
          <Suspense fallback={<PageLoader />}>
            <Routes>

              {/* ===== PUBLIC ROUTES (no layout) ===== */}
              <Route element={<GuestRoute />}>
                <Route path="/login"      element={<UnifiedAuth />} />
                <Route path="/register"   element={<UnifiedAuth />} />
              </Route>

              {/* ===== USER-FACING ROUTES ===== */}
              <Route element={<UserLayout />}>
                {/* Public user routes */}
                <Route path="/"            element={<HomePage />} />
                <Route path="/shop"        element={<ShopPage />} />
                <Route path="/search"      element={<ShopPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />

                {/* Protected user routes */}
                <Route element={<ProtectedRoute />}>
                  <Route path="/cart"           element={<CartPage />} />
                  <Route path="/checkout"       element={<CheckoutPage />} />
                  <Route path="/wishlist"       element={<WishlistPage />} />
                  <Route path="/profile"        element={<ProfilePage />} />
                  <Route path="/orders"         element={<OrdersPage />} />
                  <Route path="/orders/:id"     element={<OrderDetailPage />} />
                  <Route path="/order-success"  element={<OrderSuccessPage />} />
                </Route>
              </Route>

              {/* ===== ADMIN ROUTES ===== */}
              <Route element={<AdminRoute />}>
                <Route element={<AdminLayout />}>
                  <Route path="/admin/dashboard"    element={<AdminDashboard />} />
                  <Route path="/admin/products"     element={<AdminProducts />} />
                  <Route path="/admin/products/add" element={<AdminProductForm />} />
                  <Route path="/admin/products/:id/edit" element={<AdminProductForm />} />
                  <Route path="/admin/categories"   element={<AdminCategories />} />
                  <Route path="/admin/orders"       element={<AdminOrders />} />
                  <Route path="/admin/customers"    element={<AdminCustomers />} />
                  <Route path="/admin/coupons"      element={<AdminCoupons />} />
                  <Route path="/admin/brands"       element={<AdminBrands />} />
                  <Route path="/admin/banners"      element={<AdminBanners />} />
                </Route>
              </Route>

              {/* Fallback */}
              <Route path="*" element={<Navigate to="/" replace />} />

            </Routes>
          </Suspense>
        </CartProvider>
      </AuthProvider>
    </BrowserRouter>
  );
};

export default App;
