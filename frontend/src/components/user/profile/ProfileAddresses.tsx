import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { getAddressesApi, deleteAddressApi } from '../../../api/userApi';
import { toast } from '../../../hooks/useToast';
import type { Address } from '../../../types';
import './ProfilePayments.css'; // Reusing pane styles

const ProfileAddresses: React.FC = () => {
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAddressesApi()
      .then((r) => setAddresses(r.data.addresses || []))
      .catch(() => toast.error('Failed to load addresses'))
      .finally(() => setLoading(false));
  }, []);

  const removeAddress = async (id: string) => {
    try {
      await deleteAddressApi(id);
      setAddresses(addresses.filter(a => a._id !== id));
      toast.success('Address removed');
    } catch (err) {
      toast.error('Failed to remove address');
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="profile-payments-pane" style={{ maxWidth: '800px', padding: '0' }}>
      <section className="profile-section mt-10" style={{ margin: 0, padding: 0 }}>
        <div className="section-header mb-4" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h3 className="pane-title">Saved Addresses</h3>
          <button className="btn-add-address-small" onClick={() => navigate('/checkout')} style={{ padding: '8px 16px', background: 'none', border: '1px solid #d4d5d9', borderRadius: '4px', fontSize: '12px', fontWeight: 700, color: '#282c3f', cursor: 'pointer' }}>+ ADD NEW ADDRESS</button>
        </div>
        <div className="divider" style={{ margin: '20px 0' }} />

        <div className="address-list-compact">
          {addresses.length > 0 ? (
            addresses.map(addr => (
              <div key={addr._id} className="address-row-card" style={{ border: '1px solid #eaeaec', borderRadius: '4px', padding: '16px', marginBottom: '16px', display: 'flex', justifyContent: 'space-between' }}>
                <div className="addr-main">
                   <div className="addr-top" style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '8px' }}>
                      <span className="addr-name" style={{ fontSize: '14px', fontWeight: 700, color: '#282c3f' }}>{addr.fullName}</span>
                      <span className="addr-badge" style={{ fontSize: '10px', background: '#f5f5f6', padding: '2px 8px', borderRadius: '12px', fontWeight: 700, color: '#535766' }}>{addr.isDefault ? 'DEFAULT' : 'HOME'}</span>
                   </div>
                   <p className="addr-body" style={{ fontSize: '14px', color: '#535766', marginBottom: '8px' }}>{addr.houseName}, {addr.locality}, {addr.city}, {addr.state} - {addr.pincode}</p>
                   <p className="addr-contact" style={{ fontSize: '14px', color: '#535766' }}>Mobile: <span style={{ fontWeight: 600, color: '#282c3f' }}>{addr.mobile}</span></p>
                </div>
                <div className="addr-row-actions" style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                   <button className="btn-text" onClick={() => removeAddress(addr._id)} style={{ background: 'none', border: 'none', color: '#ff3f6c', fontSize: '12px', fontWeight: 700, cursor: 'pointer' }}>REMOVE</button>
                </div>
              </div>
            ))
          ) : (
            <div className="empty-addresses" style={{ background: '#fdfdfd', border: '1px dashed #d4d5d9', padding: '32px', textAlign: 'center', borderRadius: '4px' }}>
               <p style={{ fontSize: '14px', color: '#7e818c' }}>No saved addresses found. Add one to speed up checkout.</p>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default ProfileAddresses;
