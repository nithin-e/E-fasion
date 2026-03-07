import { useState } from 'react';
import { Outlet, NavLink, Link, useNavigate } from 'react-router-dom';
import {
  LayoutDashboard, Package, Tag, ShoppingCart,
  Users, Ticket, BarChart2, Gift, ChevronRight, LogOut, Menu
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './AdminLayout.css';

const navItems = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: <LayoutDashboard size={18} /> },
  { to: '/admin/orders', label: 'Orders', icon: <ShoppingCart size={18} /> },
  { to: '/admin/products', label: 'Products', icon: <Package size={18} /> },
  { to: '/admin/categories', label: 'Categories', icon: <Tag size={18} /> },
  { to: '/admin/customers', label: 'Customers', icon: <Users size={18} /> },
  { to: '/admin/coupons', label: 'Coupons', icon: <Ticket size={18} /> },
  { to: '/admin/offers', label: 'Offers', icon: <Gift size={18} /> },
  { to: '/admin/sales-report', label: 'Sales Report', icon: <BarChart2 size={18} /> },
];

const AdminLayout: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [collapsed, setCollapsed] = useState(false);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  return (
    <div className={`admin-layout ${collapsed ? 'admin-layout--collapsed' : ''}`}>
      {/* Sidebar */}
      <aside className="admin-sidebar">
        <div className="admin-sidebar__header">
          <Link to="/admin/dashboard" className="admin-sidebar__logo">
            {!collapsed && (
              <>
                <span className="admin-sidebar__logo-script">Suruchi</span>
                <span className="admin-sidebar__logo-sub">Admin Panel</span>
              </>
            )}
          </Link>
          <button className="admin-sidebar__toggle" onClick={() => setCollapsed(!collapsed)}>
            {collapsed ? <ChevronRight size={18} /> : <Menu size={18} />}
          </button>
        </div>

        <nav className="admin-sidebar__nav">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }: { isActive: boolean }) =>
                `admin-sidebar__link ${isActive ? 'admin-sidebar__link--active' : ''}`
              }
            >
              <span className="admin-sidebar__icon">{item.icon}</span>
              {!collapsed && <span>{item.label}</span>}
            </NavLink>
          ))}
        </nav>

        <div className="admin-sidebar__footer">
          <div className="admin-sidebar__user">
            <div className="admin-sidebar__avatar">{user?.name?.[0] || 'A'}</div>
            {!collapsed && (
              <div>
                <p className="admin-sidebar__user-name">{user?.name}</p>
                <p className="admin-sidebar__user-role">Administrator</p>
              </div>
            )}
          </div>
          <button onClick={handleLogout} className="admin-sidebar__logout">
            <LogOut size={18} />
            {!collapsed && <span>Logout</span>}
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="admin-main">
        <div className="admin-content">
          <Outlet />
        </div>
      </main>
    </div>
  );
};

export default AdminLayout;
