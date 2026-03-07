import React from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { CheckCircle, Package, ArrowRight } from 'lucide-react';
import './OrderSuccessPage.css';

const OrderSuccessPage: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const orderId = searchParams.get('orderId');

  return (
    <div className="order-success-page container">
      <div className="success-card">
        <div className="success-icon">
          <CheckCircle size={80} color="#03a685" strokeWidth={1.5} />
        </div>
        <h1>Order Placed Successfully!</h1>
        <p className="order-id-text">Order ID: <strong>{orderId || 'SF-ORD-772635'}</strong></p>
        <p className="success-message">
          Thank you for shopping with Suruchi Fashion! Your order has been placed and is being processed. 
          You will receive a confirmation email shortly.
        </p>

        <div className="success-actions">
          <button className="btn-view-orders" onClick={() => navigate('/orders')}>
            <Package size={18} /> VIEW ORDERS
          </button>
          <button className="btn-continue-shopping" onClick={() => navigate('/shop')}>
            CONTINUE SHOPPING <ArrowRight size={18} />
          </button>
        </div>
      </div>
    </div>
  );
};

export default OrderSuccessPage;
