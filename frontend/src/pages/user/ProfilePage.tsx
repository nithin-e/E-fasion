import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Package, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { getAddressesApi, deleteAddressApi } from '../../api/userApi';
import { toast } from '../../hooks/useToast';
import type { Address } from '../../types';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getAddressesApi().then((r) => setAddresses(r.data.addresses || [])).finally(() => setLoading(false));
  }, []);

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

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
    <div className="profile-page container">
      <div className="profile-layout">
        <aside className="profile-sidebar">
          <div className="user-profile-summary">
             <div className="user-avatar text-primary">{(user?.name || 'U')[0]}</div>
             <div className="user-info">
                <h4>{user?.name}</h4>
                <p>{user?.email}</p>
             </div>
          </div>
          <nav className="profile-nav">
             <button className="nav-item active"><User size={18} /> Profile Details</button>
             <button className="nav-item" onClick={() => navigate('/orders')}><Package size={18} /> My Orders</button>
             <button className="nav-item logout" onClick={handleLogout}><LogOut size={18} /> Logout</button>
          </nav>
        </aside>

        <main className="profile-main">
          {/* Profile Details Section */}
          <section className="profile-section card">
            <div className="section-header">
               <h3>Profile Details</h3>
               <button className="btn-edit-details">EDIT</button>
            </div>
            <div className="details-grid">
               <div className="detail-row"><span>Full Name</span><p>{user?.name}</p></div>
               <div className="detail-row"><span>Email ID</span><p>{user?.email}</p></div>
               <div className="detail-row"><span>Mobile Number</span><p>{user?.mobile || 'Not provided'}</p></div>
            </div>
          </section>

          {/* Addresses Section */}
          <section className="profile-section mt-8">
             <div className="section-header mb-6">
                <h3>Manage Addresses</h3>
                <button className="btn-add-address" onClick={() => navigate('/checkout')}><Plus size={14} /> ADD NEW ADDRESS</button>
             </div>
             <div className="address-cards-list">
                {addresses.map(addr => (
                  <div key={addr._id} className="profile-address-card card">
                    <div className="addr-card-header">
                       <span className="customer-name">{addr.fullName}</span>
                       <span className="type-badge">{addr.isDefault ? 'DEFAULT' : 'HOME'}</span>
                    </div>
                    <p className="addr-text">{addr.houseName}, {addr.locality}</p>
                    <p className="addr-text">{addr.city}, {addr.state} - {addr.pincode}</p>
                    <p className="addr-mobile">Mobile: <span>{addr.mobile}</span></p>
                    <div className="addr-actions">
                       <button className="btn-edit" onClick={() => toast.info('Edit address coming soon')}>EDIT</button>
                       <button className="btn-delete" onClick={() => removeAddress(addr._id)}>REMOVE</button>
                    </div>
                  </div>
                ))}
                {addresses.length === 0 && <p className="text-soft text-sm">No saved addresses found.</p>}
             </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
