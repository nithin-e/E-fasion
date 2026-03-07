import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAddressesApi } from '../../api/userApi';
import { checkoutApi, verifyPaymentApi } from '../../api/orderApi';
import { useCart } from '../../context/CartContext';
import { toast } from '../../hooks/useToast';
import type { Address } from '../../types';
import './CheckoutPage.css';

declare global { interface Window { Razorpay: any; } }

const loadRazorpayScript = () => {
  return new Promise((resolve) => {
    const script = document.createElement('script');
    script.src = 'https://checkout.razorpay.com/v1/checkout.js';
    script.onload = () => resolve(true);
    script.onerror = () => resolve(false);
    document.body.appendChild(script);
  });
};

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

  const subTotal = items.reduce((a, i) => a + (i.variantId?.price || 0) * i.quantity, 0);
  const totalMRP = items.reduce((acc, item) => (acc + (item.variantId?.price || 0) * 1.5 * item.quantity), 0);
  const discountOnMRP = totalMRP - subTotal;
  const deliveryFee = subTotal > 5000 || subTotal === 0 ? 0 : 50;
  const total = subTotal + deliveryFee;

  const handlePlaceOrder = async () => {
    if (!selectedAddressId) return toast.error('Please select a delivery address');
    if (items.length === 0) return toast.error('Your cart is empty');
    
    setIsLoading(true);
    try {
      if (paymentMethod === 'onlinepay') {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          toast.error('Razorpay SDK failed to load. Are you online?');
          setIsLoading(false);
          return;
        }
      }

      const payload = {
        addressId: selectedAddressId,
        paymentMethod,
        products: items.map((i) => ({
          productId: (i.productId as any)._id || (i.productId as any),
          variantId: i.variantId._id,
          quantity: i.quantity,
        })),
      };
      
      const res = await checkoutApi(payload);
      const { orderId, razorpayOrderId, amount } = res.data;

      if (paymentMethod === 'cod') {
        clearCart();
        toast.success('Order placed successfully!');
        navigate(`/orders/${orderId}`);
        return;
      }

      const options = {
        key: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_your_key',
        amount,
        currency: 'INR',
        name: 'E-FASHION',
        description: 'Quality Fashion at your door',
        order_id: razorpayOrderId,
        handler: async (response: any) => {
          try {
            await verifyPaymentApi({
              razorpayOrderId: response.razorpay_order_id,
              razorpayPaymentId: response.razorpay_payment_id,
              razorpaySignature: response.razorpay_signature,
            });
            clearCart();
            toast.success('Payment successful! Order confirmed.');
            navigate(`/orders/${orderId}`);
          } catch (err: any) {
            toast.error(err.response?.data?.message || 'Payment verification failed');
          }
        },
        prefill: {
          name: 'Customer Name',
          email: 'customer@example.com',
        },
        theme: { color: '#ff3f6c' },
      };

      const rzp = new window.Razorpay(options);
      rzp.on('payment.failed', function (response: any) {
        toast.error('Payment Failed: ' + response.error.description);
      });
      rzp.open();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Something went wrong');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="checkout-page container">
      {/* Step Indicator */}
      <div className="checkout-header">
        <div className="checkout-steps">
          <span className="step visited">BAG</span>
          <span className="step-line" />
          <span className={`step ${checkoutStep === 'address' ? 'active' : 'visited'}`}>ADDRESS</span>
          <span className="step-line" />
          <span className={`step ${checkoutStep === 'payment' ? 'active' : ''}`}>PAYMENT</span>
        </div>
      </div>

      <div className="checkout-content">
        <div className="checkout-left">
          {checkoutStep === 'address' ? (
            <div className="checkout-section">
              <div className="section-title-row">
                <h3>Select Delivery Address</h3>
                <button className="btn-add-new" onClick={() => navigate('/profile')}>ADD NEW ADDRESS</button>
              </div>
              <p className="section-sub">DEFAULT ADDRESS</p>
              <div className="address-list">
                {addresses.map((addr) => (
                  <div 
                    key={addr._id} 
                    className={`address-item-card ${selectedAddressId === addr._id ? 'selected' : ''}`}
                    onClick={() => setSelectedAddressId(addr._id)}
                  >
                    <div className="card-selector">
                       <div className={`radio-circle ${selectedAddressId === addr._id ? 'checked' : ''}`} />
                    </div>
                    <div className="card-info">
                       <div className="card-name-row">
                          <span className="name">{addr.fullName}</span>
                          <span className="badge">HOME</span>
                       </div>
                       <p className="text">{addr.houseName}, {addr.locality}</p>
                       <p className="text">{addr.city}, {addr.state} - {addr.pincode}</p>
                       <p className="mobile">Mobile: <span>{addr.mobile}</span></p>
                       
                       {selectedAddressId === addr._id && (
                         <div className="card-footer">
                            <button className="btn-deliver" onClick={() => setCheckoutStep('payment')}>DELIVER HERE</button>
                         </div>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="checkout-section">
               <h3 className="mb-4">Choose Payment Mode</h3>
               <div className="payment-modes">
                  <div className="payment-sidebar">
                     <button className={`p-nav-item ${paymentMethod === 'onlinepay' ? 'active' : ''}`} onClick={() => setPaymentMethod('onlinepay')}>
                        Online Payment
                     </button>
                     <button className={`p-nav-item ${paymentMethod === 'cod' ? 'active' : ''}`} onClick={() => setPaymentMethod('cod')}>
                        Cash on Delivery
                     </button>
                  </div>
                  <div className="payment-body">
                     {paymentMethod === 'onlinepay' ? (
                       <div className="payment-detail">
                          <p className="title">Pay Online (Recommended)</p>
                          <p className="sub">Fastest checkout with UPI, Cards and more.</p>
                          <div className="online-badges">
                             <img src="https://constant.myntassets.com/checkout/assets/img/vpa-upi.png" alt="upi" height="20" />
                             <img src="https://constant.myntassets.com/checkout/assets/img/visa.png" alt="visa" height="20" />
                             <img src="https://constant.myntassets.com/checkout/assets/img/mastercard.png" alt="master" height="20" />
                          </div>
                       </div>
                     ) : (
                       <div className="payment-detail">
                          <p className="title">Cash on Delivery</p>
                          <p className="sub">You can pay via Cash/UPI on delivery.</p>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="checkout-right">
           <div className="coupons-section">
              <p className="label">COUPONS</p>
              <div className="coupon-box">
                 <span className="icon">🏷️</span>
                 <span className="text">Apply Coupon</span>
                 <button className="btn-apply">APPLY</button>
              </div>
           </div>

           <div className="price-summary">
              <p className="label">PRICE DETAILS ({items.length} Items)</p>
              <div className="rows">
                 <div className="row"><span>Total MRP</span><span>₹{Math.floor(totalMRP)}</span></div>
                 <div className="row"><span>Discount on MRP</span><span className="text-pink">-₹{Math.floor(discountOnMRP)}</span></div>
                 <div className="row"><span>Coupon Discount</span><span className="text-pink">Apply Coupon</span></div>
                 <div className="row">
                    <span>Delivery Fee</span>
                    <span>{deliveryFee === 0 ? <span className="text-green">FREE</span> : `₹${deliveryFee}`}</span>
                 </div>
              </div>
              <div className="divider" />
              <div className="total-row">
                 <span>Total Amount</span>
                 <span>₹{Math.floor(total)}</span>
              </div>
              {checkoutStep === 'payment' && (
                <button className="btn-final-order" onClick={handlePlaceOrder} disabled={isLoading}>
                   {isLoading ? 'PROCESSING...' : 'PAY NOW'}
                </button>
              )}
           </div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutPage;
