import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Package, ChevronRight } from 'lucide-react';
import { getMyOrdersApi } from '../../api/orderApi';
import type { Order } from '../../types';
import './OrdersPage.css';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getMyOrdersApi().then((r) => setOrders(r.data.orders || [])).finally(() => setLoading(false));
  }, []);

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="orders-page container">
      <div className="orders-header">
         <h1>My Orders</h1>
      </div>

      {orders.length === 0 ? (
        <div className="empty-state">
          <div className="empty-state-icon"><Package size={48} /></div>
          <h3>You haven't placed any orders yet!</h3>
          <p>Once you place an order, you can track it here.</p>
          <Link to="/shop" className="btn btn-primary mt-6">START SHOPPING</Link>
        </div>
      ) : (
        <div className="orders-list-v2">
          {orders.map((order) => (
            <div key={order._id} className="order-group-card" onClick={() => window.location.href = `/orders/${order._id}`}>
              <div className="order-group-header">
                 <div className="order-main-info">
                    <span className="order-status-dot" data-status={order.orderStatus}></span>
                    <span className="order-status-text">{order.orderStatus.toUpperCase()}</span>
                    <span className="order-date">On {new Date(order.createdAt).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' })}</span>
                 </div>
                 <Link to={`/orders/${order._id}`} className="btn-v-details" onClick={(e) => e.stopPropagation()}>
                    VIEW DETAILS
                 </Link>
              </div>

              <div className="order-products-grid">
                {order.products.map((p, idx) => {
                  const prod = p.productId as any;
                  const variant = p.variantId as any;
                  return (
                    <div key={idx} className="order-item-row">
                      <div className="order-item-img">
                         <img src={variant?.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=100'} alt="" />
                      </div>
                      <div className="order-item-info">
                         <h4 className="item-brand">{prod?.brand || 'Suruchi Fashion'}</h4>
                         <p className="item-name">{prod?.name || 'Women Fashion'}</p>
                         <div className="item-meta">
                            <span>Size: {variant?.size}</span>
                            <span>Qty: {p.quantity}</span>
                         </div>
                      </div>
                      <div className="item-arrow">
                         <ChevronRight size={24} />
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default OrdersPage;
