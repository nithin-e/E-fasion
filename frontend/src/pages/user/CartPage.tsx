import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';

import './CartPage.css';

const CartPage: React.FC = () => {
  const { items, isLoading, fetchCart, removeItem, count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) fetchCart();
  }, [user, fetchCart]);

  const totalMRP = items.reduce((acc, item) => {
    const price = (item.variantId?.price ?? 0) * 1.5; // Mocking MRP
    return acc + price * item.quantity;
  }, 0);
  
  const subTotal = items.reduce((acc, item) => {
    const price = item.variantId?.price ?? 0;
    return acc + price * item.quantity;
  }, 0);

  const discountOnMRP = totalMRP - subTotal;
  const deliveryFee = subTotal > 5000 || subTotal === 0 ? 0 : 50;
  const total = subTotal + deliveryFee;

  if (!user) return (
    <div className="container">
      <div className="empty-state" style={{ marginTop: '4rem' }}>
        <div className="empty-state-icon"><ShoppingBag size={36} /></div>
        <h3>Please log in to view your bag</h3>
        <Link to="/login" className="btn btn-primary mt-4">Login</Link>
      </div>
    </div>
  );

  if (isLoading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="bag-page container">
      {/* Step Indicator */}
      <div className="bag-steps">
        <span className="step active">BAG</span>
        <span className="step-divider">----------</span>
        <span className="step">ADDRESS</span>
        <span className="step-divider">----------</span>
        <span className="step">PAYMENT</span>
      </div>

      {items.length === 0 ? (
        <div className="empty-state">
           <div style={{ marginBottom: 20 }}>
             <img src="https://constant.myntassets.com/checkout/assets/img/empty-bag.png" alt="Empty Bag" style={{ width: 150 }} />
           </div>
           <h3 style={{ fontSize: 20, marginBottom: 8 }}>Hey, it feels so light!</h3>
           <p style={{ color: '#7e818c', marginBottom: 24 }}>There is nothing in your bag. Let's add some items.</p>
           <Link to="/wishlist" className="btn btn-outline" style={{ color: '#ff3f6c', borderColor: '#ff3f6c', padding: '12px 24px', fontWeight: 700 }}>ADD ITEMS FROM WISHLIST</Link>
        </div>
      ) : (
        <div className="bag-layout">
          {/* Left Pane - Items */}
          <div className="bag-items-section">
            <div className="bag-header-actions">
               <span>Delivery to: <b style={{ color: '#282c3f' }}>110001</b></span>
               <div className="delivery-check">
                  <button>Change</button>
               </div>
            </div>

            <div className="available-offers">
               <h4><img src="https://constant.myntassets.com/checkout/assets/img/local-offer-icon.png" width="16" alt="%" /> Available Offers</h4>
               <ul>
                 <li>10% Instant Discount on SBI Credit and Debit Cards on a min spend of ₹3,000. TCA</li>
               </ul>
               <button className="offer-show-more">Show More ∨</button>
            </div>

            <div className="bag-items-list">
              {items.map((item) => (
                <div key={item.variantId._id} className="bag-item-card">
                  <div className="bag-item-img">
                    <img src={item.variantId?.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=200'} alt="" />
                    <input type="checkbox" className="bag-item-selector" defaultChecked />
                  </div>
                  
                  <div className="bag-item-details">
                    <button className="bag-item-remove-cross" onClick={() => removeItem(item.variantId._id)}>
                       <X size={18} />
                    </button>
                    
                    <h4 className="bag-item-brand">{(item.productId as any)?.brand || 'Brand'}</h4>
                    <p className="bag-item-name">{(item.productId as any)?.name}</p>
                    
                    <div className="bag-item-selectors-row">
                       <button className="selector-btn">Size: {item.variantId?.size} <span>▼</span></button>
                       <button className="selector-btn">Qty: {item.quantity} <span>▼</span></button>
                    </div>

                    <div className="bag-item-price-row">
                       <span className="price-now">₹{item.variantId?.price}</span>
                       <span className="price-mrp">₹{Math.floor(item.variantId?.price * 1.5)}</span>
                       <span className="price-disc">33% OFF</span>
                    </div>

                    <div className="return-policy"><b>14 days</b> return available</div>
                    <div className="delivery-estimate">Delivery by <b>2 Days</b></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Right Pane - Summary */}
          <div className="bag-summary-section">
            <div className="coupons-banner">COUPONS</div>
            <div className="coupon-box">
               <div className="coupon-box-left">
                  <img src="https://constant.myntassets.com/checkout/assets/img/coupon-icon.png" width="24" alt="tag" />
                  <span>Apply Coupons</span>
               </div>
               <button className="btn-apply-coupon">APPLY</button>
            </div>

            <h4 className="summary-title">PRICE DETAILS ({count} Items)</h4>
            <div className="price-breakdown">
               <div className="price-row"><span>Total MRP</span><span>₹{Math.floor(totalMRP)}</span></div>
               <div className="price-row"><span>Discount on MRP</span><span className="text-green">-₹{Math.floor(discountOnMRP)}</span></div>
               <div className="price-row"><span>Coupon Discount</span><span className="text-pink">Apply Coupon</span></div>
               <div className="price-row"><span>Platform Fee</span><span className="text-green">FREE</span></div>
               <div className="price-row">
                  <span>Shipping Fee</span>
                  <span>{deliveryFee === 0 ? <span className="text-green">FREE</span> : `₹${deliveryFee}`}</span>
               </div>
               <div className="price-row total-row">
                  <span>Total Amount</span>
                  <span>₹{Math.floor(total)}</span>
               </div>
            </div>
            
            <button className="btn-place-order" onClick={() => navigate('/checkout')}>
               PLACE ORDER
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default CartPage;
