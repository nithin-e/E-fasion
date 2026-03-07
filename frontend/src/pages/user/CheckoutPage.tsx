import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAddressesApi } from '../../api/userApi';
import { checkoutApi, verifyPaymentApi } from '../../api/orderApi';
import { useCart } from '../../context/CartContext';
import { toast } from '../../hooks/useToast';
import type { Address } from '../../types';
import './CheckoutPage.css';

declare global { interface Window { Razorpay: any; } }

const CheckoutPage: React.FC = () => {
  const navigate = useNavigate();
  const { items, clearCart } = useCart();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddressId, setSelectedAddressId] = useState('');
  const [paymentMethod, setPaymentMethod] = useState<'onlinepay' | 'cod'>('onlinepay');
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'address' | 'payment'>('address');

  useEffect(() => {
    getAddressesApi().then((r) => {
      const addrs: Address[] = r.data.addresses || [];
      setAddresses(addrs);
      const def = addrs.find((a) => a.isDefault);
      if (def) setSelectedAddressId(def._id);
    });
  }, []);

  const totalMRP = items.reduce((acc, item) => (acc + (item.variantId?.price || 0) * 1.5 * item.quantity), 0);
  const subTotal = items.reduce((a, i) => a + (i.variantId?.price || 0) * i.quantity, 0);
  const discountOnMRP = totalMRP - subTotal;
  const deliveryFee = subTotal > 5000 || subTotal === 0 ? 0 : 50;
  const total = subTotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) return toast.error('Please select a delivery address');
    if (items.length === 0) return toast.error('Your cart is empty');
    setIsLoading(true);
    try {
      const payload = {
        addressId: selectedAddressId,
        paymentMethod,
        products: items.map((i) => ({
          productId: (i.productId as any)._id,
          variantId: i.variantId._id,
          quantity: i.quantity,
        })),
      };
      const res = await checkoutApi(payload);
      const { orderId, razorpayOrderId, amount } = res.data;

      if (paymentMethod === 'cod') {
        clearCart();
        navigate(`/orders/${orderId}`);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY,
        amount,
        currency: 'INR',
        order_id: razorpayOrderId,
        name: 'Suruchi Fashion',
        description: 'Payment for your order',
        handler: async (response: any) => {
          await verifyPaymentApi({
            razorpayOrderId: response.razorpay_order_id,
            razorpayPaymentId: response.razorpay_payment_id,
            razorpaySignature: response.razorpay_signature,
          });
          clearCart();
          toast.success('Payment successful!');
          navigate(`/orders/${orderId}`);
        },
        theme: { color: '#ff3f6c' },
      };
      const rz = new window.Razorpay(options);
      rz.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Order failed');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="checkout-page container">
      {/* Step Indicator */}
      <div className="bag-steps checkout-steps-header">
        <span className="step" onClick={() => navigate('/cart')}>BAG</span>
        <span className="step-divider">----------</span>
        <span className={`step ${checkoutStep === 'address' ? 'active' : ''}`}>ADDRESS</span>
        <span className="step-divider">----------</span>
        <span className={`step ${checkoutStep === 'payment' ? 'active' : ''}`}>PAYMENT</span>
      </div>

      <div className="checkout-layout">
        <div className="checkout-main">
          {checkoutStep === 'address' ? (
            <div className="address-selection-area">
              <div className="section-header">
                 <h4>Select Delivery Address</h4>
                 <button className="btn-add-address" onClick={() => navigate('/profile')}>ADD NEW ADDRESS</button>
              </div>
              
              <div className="address-list-grid">
                {addresses.map((addr) => (
                  <div key={addr._id} className={`address-card ${selectedAddressId === addr._id ? 'selected' : ''}`} onClick={() => setSelectedAddressId(addr._id)}>
                    <div className="address-card-header">
                      <span className="customer-name">{addr.fullName}</span>
                      {addr.isDefault && <span className="type-badge">DEFAULT</span>}
                    </div>
                    <p className="address-text">{addr.houseName}, {addr.locality}</p>
                    <p className="address-text">{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="mobile-text">Mobile: <span>{addr.mobile}</span></p>
                    {selectedAddressId === addr._id && (
                      <div className="address-card-actions">
                        <button className="btn-remove">REMOVE</button>
                        <button className="btn-edit">EDIT</button>
                      </div>
                    )}
                    {selectedAddressId === addr._id && (
                       <button className="btn-deliver-here" onClick={() => setCheckoutStep('payment')}>DELIVER HERE</button>
                    )}
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="payment-selection-area">
               <h4 className="section-title">Choose Payment Mode</h4>
               <div className="payment-options-list">
                 <div className={`payment-option ${paymentMethod === 'onlinepay' ? 'active' : ''}`} onClick={() => setPaymentMethod('onlinepay')}>
                    <span className="opt-icon">💳</span>
                    <div className="opt-details">
                       <p className="opt-name">Pay Online (Recommended)</p>
                       <p className="opt-sub">UPI, Cards, Netbanking</p>
                    </div>
                 </div>
                 <div className={`payment-option ${paymentMethod === 'cod' ? 'active' : ''}`} onClick={() => setPaymentMethod('cod')}>
                    <span className="opt-icon">💵</span>
                    <div className="opt-details">
                       <p className="opt-name">Cash on Delivery</p>
                       <p className="opt-sub">Pay when delivered</p>
                    </div>
                 </div>
               </div>
            </div>
          )}
        </div>

        <div className="checkout-summary">
           <h4 className="summary-title">PRICE DETAILS ({items.length} Items)</h4>
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
           {checkoutStep === 'payment' && (
              <button className="btn-place-order" onClick={handlePlaceOrder} disabled={isLoading}>
                 {isLoading ? 'PLACING ORDER...' : 'PLACE ORDER'}
              </button>
           )}
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
