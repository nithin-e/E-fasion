import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { X, ShoppingBag, Heart } from 'lucide-react';
import { useCart } from '../../context/CartContext';
import { useAuth } from '../../context/AuthContext';
import { addToWishlistApi } from '../../api/userApi';
import { toast } from '../../hooks/useToast';
import './CartPage.css';

const CartPage: React.FC = () => {
  const { items, isLoading, fetchCart, removeItem, updateQty, count } = useCart();
  const { user } = useAuth();
  const navigate = useNavigate();

  const handleMoveToWishlist = async (productId: string, variantId: string) => {
    try {
      await addToWishlistApi(productId);
      await removeItem(variantId);
      toast.success('Moved to Wishlist');
    } catch (err) {
      toast.error('Failed to move to wishlist');
    }
  };

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
          <div className="empty-state-icon"><ShoppingBag size={48} /></div>
          <h3>Hey, it feels so light!</h3>
          <p>There is nothing in your bag. Let's add some items.</p>
          <Link to="/shop" className="btn btn-outline mt-6">ADD ITEMS FROM WISHLIST</Link>
        </div>
      ) : (
        <div className="bag-layout">
          <div className="bag-items-section">
            <div className="bag-header-actions">
               <span>{count} Items Selected for Order</span>
            </div>

            <div className="bag-items-list">
              {items.map((item) => (
                <div key={item.variantId._id} className="bag-item-card">
                  <div className="bag-item-img">
                    <img src={item.variantId?.images?.[0] || 'https://images.unsplash.com/photo-1515886657613-9f3515b0c78f?auto=format&fit=crop&q=80&w=200'} alt="" />
                  </div>
                  <div className="bag-item-details">
                    <h4 className="bag-item-brand">{(item.productId as any)?.brand}</h4>
                    <p className="bag-item-name">{(item.productId as any)?.name}</p>
                    <div className="bag-item-meta">
                       <div className="bag-item-qty-selector">
                          <button onClick={() => updateQty(item.variantId._id, item.quantity - 1)} disabled={item.quantity <= 1}>−</button>
                          <span>Qty: {item.quantity}</span>
                          <button onClick={() => updateQty(item.variantId._id, item.quantity + 1)}>+</button>
                       </div>
                       <div className="divider-v" />
                       <span>Size: {item.variantId?.size}</span>
                    </div>
                    <div className="bag-item-price-row">
                       <span className="price-now">₹{item.variantId?.price}</span>
                       <span className="price-mrp">₹{Math.floor(item.variantId?.price * 1.5)}</span>
                       <span className="price-disc">33% OFF</span>
                    </div>
                  </div>
                  <div className="bag-item-right-actions">
                    <button className="bag-item-remove" onClick={() => removeItem(item.variantId._id)}>
                      <X size={18} />
                    </button>
                    <button className="bag-item-wishlist-move" onClick={() => handleMoveToWishlist((item.productId as any)._id, item.variantId._id)}>
                      <Heart size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="bag-summary-section">
            <h4 className="summary-title">PRICE DETAILS ({count} Items)</h4>
            <div className="price-breakdown">
               <div className="price-row"><span>Total MRP</span><span>₹{Math.floor(totalMRP)}</span></div>
               <div className="price-row"><span>Discount on MRP</span><span className="text-success">-₹{Math.floor(discountOnMRP)}</span></div>
               <div className="price-row"><span>Coupon Discount</span><span className="text-primary">Apply Coupon</span></div>
               <div className="price-row">
                  <span>Delivery Charges</span>
                  <span>{deliveryFee === 0 ? <span className="text-success">FREE</span> : `₹${deliveryFee}`}</span>
               </div>
               <div className="price-divider" />
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
