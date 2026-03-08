import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAddressesApi } from '../../api/userApi';
import { checkoutApi, verifyPaymentApi } from '../../api/orderApi';
import { useCart } from '../../context/CartContext';
import { toast } from '../../hooks/useToast';
import AddressModal from '../../components/user/AddressModal';
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
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'upi' | 'card' | 'wallets' | 'paylater' | 'emi' | 'netbanking'>('cod');
  const [isLoading, setIsLoading] = useState(false);
  const [checkoutStep, setCheckoutStep] = useState<'address' | 'payment'>('address');
  const [showAddressModal, setShowAddressModal] = useState(false);

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
      if (paymentMethod !== 'cod') {
        const loaded = await loadRazorpayScript();
        if (!loaded) {
          toast.error('Razorpay SDK failed to load. Are you online?');
          setIsLoading(false);
          return;
        }
      }

      const payload = {
        addressId: selectedAddressId,
        paymentMethod: (paymentMethod === 'cod' ? 'cod' : 'onlinepay') as 'cod' | 'onlinepay',
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
              </div>
              
              <div className="btn-add-new-box" onClick={() => setShowAddressModal(true)}>
                 <span className="btn-add-new-text">+ ADD NEW ADDRESS</span>
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
                    
                    <div className="card-info" style={{ width: '100%' }}>
                       <div className="card-name-row">
                          <span className="name">{addr.fullName}</span>
                          <span className="badge">HOME</span>
                       </div>
                       <p className="text">{addr.houseName}, {addr.locality}</p>
                       <p className="text">{addr.city}, {addr.state} - <b>{addr.pincode}</b></p>
                       <p className="mobile">Mobile: <span>{addr.mobile}</span></p>
                       
                       {selectedAddressId === addr._id && (
                         <>
                           <div className="pay-on-delivery-estimate">
                              • Pay on Delivery available
                           </div>
                           <button className="btn-deliver" onClick={() => setCheckoutStep('payment')}>DELIVER HERE</button>
                         </>
                       )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="checkout-section">
               <h3 className="mb-4" style={{ fontSize: 16, fontWeight: 700, marginBottom: 16 }}>Choose Payment Mode</h3>
               <div className="payment-modes">
                  <div className="payment-sidebar">
                     <button className={`p-nav-item ${paymentMethod === 'cod' ? 'active' : ''}`} onClick={() => setPaymentMethod('cod')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                           <img src="https://constant.myntassets.com/checkout/assets/img/cod.png" width="20" alt="cod" />
                           <span>Cash On Delivery (Cash/UPI)</span>
                        </div>
                     </button>
                     <button className={`p-nav-item ${paymentMethod === 'upi' ? 'active' : ''}`} onClick={() => setPaymentMethod('upi')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                           <img src="https://constant.myntassets.com/checkout/assets/img/vpa-upi.png" width="20" alt="upi" />
                           <span>UPI (Pay via any App)</span>
                        </div>
                     </button>
                     <button className={`p-nav-item ${paymentMethod === 'card' ? 'active' : ''}`} onClick={() => setPaymentMethod('card')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                           <img src="https://constant.myntassets.com/checkout/assets/img/credit-card.png" width="20" alt="card" />
                           <span>Credit/Debit Card</span>
                        </div>
                     </button>
                     <button className={`p-nav-item ${paymentMethod === 'wallets' ? 'active' : ''}`} onClick={() => setPaymentMethod('wallets')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                           <img src="https://constant.myntassets.com/checkout/assets/img/wallets.png" width="20" alt="wallet" />
                           <span>Wallets</span>
                        </div>
                     </button>
                     <button className={`p-nav-item ${paymentMethod === 'paylater' ? 'active' : ''}`} onClick={() => setPaymentMethod('paylater')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                           <img src="https://constant.myntassets.com/checkout/assets/img/paylater.png" width="20" alt="paylater" />
                           <span>Pay Later</span>
                        </div>
                     </button>
                     <button className={`p-nav-item ${paymentMethod === 'emi' ? 'active' : ''}`} onClick={() => setPaymentMethod('emi')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                           <img src="https://constant.myntassets.com/checkout/assets/img/emi.png" width="20" alt="emi" />
                           <span>EMI</span>
                        </div>
                     </button>
                     <button className={`p-nav-item ${paymentMethod === 'netbanking' ? 'active' : ''}`} onClick={() => setPaymentMethod('netbanking')}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                           <img src="https://constant.myntassets.com/checkout/assets/img/netbanking.png" width="20" alt="netbanking" />
                           <span>Net Banking</span>
                        </div>
                     </button>
                  </div>
                  
                  <div className="payment-body">
                     {paymentMethod === 'cod' && (
                       <div>
                          <p className="payment-detail-title">Cash on Delivery (Cash/UPI)</p>
                          <div className="cod-box">
                             <div className="cod-head">
                                <img src="https://constant.myntassets.com/checkout/assets/img/cod.png" width="24" alt="cod" />
                                <span>Cash / UPI on Delivery</span>
                             </div>
                             <div className="cod-sub">You can pay via Cash or UPI at the time of delivery.</div>
                             <button className="btn-cod-place" onClick={handlePlaceOrder} disabled={isLoading}>
                                {isLoading ? 'PROCESSING...' : 'PLACE ORDER'}
                             </button>
                          </div>
                       </div>
                     )}

                     {paymentMethod === 'upi' && (
                       <div>
                          <p className="payment-detail-title">Pay via UPI App</p>
                          <div className="upi-box">
                             <div className="upi-app-row">
                                <div className="upi-app-name">
                                   <img src="https://constant.myntassets.com/checkout/assets/img/phonepe.png" alt="PhonePe"/> PhonePe
                                </div>
                                <div className="upi-app-radio checked" />
                             </div>
                             <div className="upi-app-row">
                                <div className="upi-app-name">
                                   <img src="https://constant.myntassets.com/checkout/assets/img/googlepay.png" alt="Google Pay"/> Google Pay
                                </div>
                                <div className="upi-app-radio" />
                             </div>
                             <div className="upi-app-row">
                                <div className="upi-app-name">
                                   <img src="https://constant.myntassets.com/checkout/assets/img/paytm.png" alt="Paytm"/> Paytm
                                </div>
                                <div className="upi-app-radio" />
                             </div>
                          </div>
                          <button className="btn-cod-place" onClick={handlePlaceOrder} disabled={isLoading}>
                             {isLoading ? 'PROCESSING...' : 'PAY NOW'}
                          </button>
                       </div>
                     )}
                     
                     {['card', 'wallets', 'paylater', 'emi', 'netbanking'].includes(paymentMethod) && (
                       <div>
                          <p className="payment-detail-title">Pay securely with Razorpay</p>
                          <p style={{ color: '#535766', fontSize: 13, lineHeight: 1.5 }}>
                            We use Razorpay to process all Cards, Netbanking, EMIs, and Wallets securely. 
                            Click 'Pay Now' to open the secure payment gateway.
                          </p>
                          <div style={{ marginTop: 24, display: 'flex', gap: 12, alignItems: 'center' }}>
                             <img src="https://constant.myntassets.com/checkout/assets/img/visa.png" alt="visa" height="24" />
                             <img src="https://constant.myntassets.com/checkout/assets/img/mastercard.png" alt="master" height="24" />
                             <img src="https://constant.myntassets.com/checkout/assets/img/rupay.png" alt="rupay" height="24" />
                          </div>
                          <button className="btn-cod-place" onClick={handlePlaceOrder} disabled={isLoading}>
                             {isLoading ? 'PROCESSING...' : 'PAY NOW'}
                          </button>
                       </div>
                     )}
                  </div>
               </div>
            </div>
          )}
        </div>

        <div className="checkout-right">
           <div className="delivery-estimate-box">
              DELIVERY ESTIMATES
              <div style={{ marginTop: 12, fontSize: 13, color: '#535766' }}>
                 Estimated delivery by <b>{new Date(Date.now() + 2 * 24 * 60 * 60 * 1000).toLocaleDateString()}</b>
              </div>
           </div>

           <div className="price-summary">
              <p className="label">PRICE DETAILS ({items.length} Items)</p>
              <div className="rows">
                 <div className="row"><span>Total MRP</span><span>₹{Math.floor(totalMRP)}</span></div>
                 <div className="row"><span>Discount on MRP</span><span className="text-green">-₹{Math.floor(discountOnMRP)}</span></div>
                 <div className="row"><span>Platform Fee</span><span className="text-green">FREE</span></div>
                 <div className="row">
                    <span>Shipping Fee</span>
                    <span>{deliveryFee === 0 ? <span className="text-green">FREE</span> : `₹${deliveryFee}`}</span>
                 </div>
              </div>
              <div className="divider" />
              <div className="total-row">
                 <span>Total Amount</span>
                 <span>₹{Math.floor(total)}</span>
              </div>
           </div>
        </div>
      </div>

      {showAddressModal && (
        <AddressModal
          onClose={() => setShowAddressModal(false)}
          onSuccess={(newAddr) => {
            setAddresses((prev) => [...prev, newAddr]);
            setSelectedAddressId(newAddr._id);
            setShowAddressModal(false);
          }}
        />
      )}
    </div>
  );
};

export default CheckoutPage;
