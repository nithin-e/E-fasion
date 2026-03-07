import React, { useEffect, useState } from 'react';
import { getAllOrdersApi, updateOrderStatusApi } from '../../api/orderApi';
import type { Order } from '../../types';
import OrderStatusBadge from '../../components/shared/OrderStatusBadge';
import { toast } from '../../hooks/useToast';

const STATUS_OPTIONS: Order['orderStatus'][] = ['pending', 'processing', 'dispatched', 'delivered', 'cancelled', 'returned'];

const AdminOrders: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getAllOrdersApi().then((r) => setOrders(r.data.orders || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleStatusChange = async (id: string, status: string) => {
    await updateOrderStatusApi(id, status);
    toast.success('Order status updated');
    load();
  };

  return (
    <div>
      <div className="admin-page-header"><div><h1>Orders</h1><p>Manage and track all customer orders</p></div></div>
      {loading ? <div className="page-loader"><div className="spinner" /></div> : (
        <div className="table-wrapper card">
          <table className="table">
            <thead>
              <tr><th>Order ID</th><th>Customer</th><th>Total</th><th>Payment</th><th>Status</th><th>Update Status</th></tr>
            </thead>
            <tbody>
              {orders.map((o) => (
                <tr key={o._id}>
                  <td className="font-medium" style={{fontFamily:'monospace'}}>#{o._id.slice(-8).toUpperCase()}</td>
                  <td className="text-sm">{(o.userId as any)?.name || '—'}<br /><span className="text-xs text-soft">{new Date(o.createdAt).toLocaleDateString('en-IN')}</span></td>
                  <td className="font-semibold">₹{o.grandTotal.toLocaleString('en-IN')}</td>
                  <td><span className={`badge ${o.paymentStatus === 'paid' ? 'badge-success' : 'badge-warning'}`}>{o.paymentStatus}</span></td>
                  <td><OrderStatusBadge status={o.orderStatus} /></td>
                  <td>
                    <select
                      className="form-input"
                      style={{ padding: '0.4rem 0.75rem', fontSize: 'var(--text-xs)', width: 150 }}
                      value={o.orderStatus}
                      onChange={(e) => handleStatusChange(o._id, e.target.value)}
                    >
                      {STATUS_OPTIONS.map((s) => <option key={s} value={s}>{s}</option>)}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminOrders;
