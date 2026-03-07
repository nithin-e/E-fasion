import React, { useEffect, useState } from 'react';
import { ShoppingBag, Users, Package, TrendingUp } from 'lucide-react';
import { getDashboardStatsApi } from '../../api/userApi';
import './AdminDashboard.css';

const AdminDashboard: React.FC = () => {
  const [stats, setStats] = useState({ totalOrders: 0, totalRevenue: 0, totalCustomers: 0, totalProducts: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getDashboardStatsApi()
      .then((r) => setStats(r.data.stats || stats))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const kpis = [
    { icon: <ShoppingBag size={22}/>, label: 'Total Orders', value: stats.totalOrders, color: '#3B82F6', bg: '#EFF6FF' },
    { icon: <TrendingUp size={22}/>, label: 'Total Revenue', value: `₹${stats.totalRevenue.toLocaleString('en-IN')}`, color: '#4CAF7D', bg: '#F0FAF5' },
    { icon: <Users size={22}/>, label: 'Customers', value: stats.totalCustomers, color: '#C8A97E', bg: '#F5EEE8' },
    { icon: <Package size={22}/>, label: 'Products', value: stats.totalProducts, color: '#8B5CF6', bg: '#F5F3FF' },
  ];

  return (
    <div>
      <div className="admin-page-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome back! Here's an overview of your store.</p>
        </div>
      </div>

      <div className="admin-kpi-grid">
        {kpis.map((k) => (
          <div key={k.label} className="admin-kpi-card">
            <div className="admin-kpi-icon" style={{ background: k.bg, color: k.color }}>{k.icon}</div>
            <p className="admin-kpi-value">{loading ? '—' : k.value}</p>
            <p className="admin-kpi-label">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="admin-chart-placeholder card card-body">
        <h3>Sales Overview</h3>
        <p className="text-soft text-sm mt-2">Connect a charting library like Recharts or Chart.js to display sales analytics here.</p>
        <div className="admin-chart-visual">
          {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 88].map((h, i) => (
            <div key={i} className="admin-chart-bar" style={{ height: `${h}%` }} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
