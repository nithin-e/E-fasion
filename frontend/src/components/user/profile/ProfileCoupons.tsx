import React, { useEffect, useState } from 'react';
import api from '../../../api/axios';
import { toast } from '../../../hooks/useToast';
import './ProfileCoupons.css';

interface Coupon {
  _id: string;
  code: string;
  discount: number;
  minPurchase: number;
  expiresAt: string;
}

const ProfileCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await api.get('/users/coupons');
      setCoupons(res.data.coupons);
    } catch (err: any) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="profile-coupons-pane">
      <h3 className="pane-title">Coupons</h3>
      <div className="divider" style={{ margin: '20px 0' }} />

      {coupons.length === 0 ? (
        <div className="empty-state">
          <p>No active coupons right now. Keep shopping to unlock more!</p>
        </div>
      ) : (
        <div className="coupons-grid">
          {coupons.map(coupon => (
            <div key={coupon._id} className="coupon-card">
              <div className="coupon-left">
                <span className="coupon-discount">{coupon.discount}% OFF</span>
                <span className="coupon-min">Min purchase ₹{coupon.minPurchase}</span>
              </div>
              <div className="coupon-right">
                <p className="coupon-code">{coupon.code}</p>
                <p className="coupon-validity">Valid till {new Date(coupon.expiresAt).toLocaleDateString()}</p>
                <button className="btn-copy">COPY CODE</button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default ProfileCoupons;
