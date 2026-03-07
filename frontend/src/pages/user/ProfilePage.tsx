import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { User, LogOut, Package } from 'lucide-react';
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
          <div className="sidebar-header">
             <div className="user-avatar">{(user?.name || 'U')[0]}</div>
             <div className="user-meta">
                <p className="user-name">{user?.name}</p>
                <p className="user-email">{user?.email}</p>
             </div>
          </div>
          <nav className="profile-nav">
             <div className="nav-group">
                <p className="nav-group-title">OVERVIEW</p>
                <button className="nav-item active"><User size={16} /> Profile</button>
                <button className="nav-item" onClick={() => navigate('/orders')}><Package size={16} /> Orders & Returns</button>
             </div>
             <div className="divider-nav" />
             <div className="nav-group">
                <p className="nav-group-title">PAYMENTS</p>
                <button className="nav-item"><div className="wallet-icon-small" /> Wallet <span className="wallet-balance-tag">₹{user?.wallet || 0}</span></button>
                <button className="nav-item">Saved Cards</button>
             </div>
             <div className="divider-nav" />
             <button className="nav-item logout" onClick={handleLogout}><LogOut size={16} /> Logout</button>
          </nav>
        </aside>

        <main className="profile-main">
          {/* Wallet Summary Card */}
          <section className="profile-section-simple">
             <div className="wallet-highlight-card">
                <div className="wallet-info">
                   <p className="label">E-FASHION WALLET Balance</p>
                   <h2>₹{user?.wallet || 0}</h2>
                </div>
                <button className="btn-add-money">ADD MONEY</button>
             </div>
          </section>

          {/* Profile Details Section */}
          <section className="profile-section card-no-border">
            <div className="section-header">
               <h3>Profile Details</h3>
               <button className="btn-edit-text">EDIT</button>
            </div>
            <div className="profile-details-grid">
               <div className="detail-item">
                  <span className="label">Full Name</span>
                  <p className="value">{user?.name}</p>
               </div>
               <div className="detail-item">
                  <span className="label">Email ID</span>
                  <p className="value">{user?.email}</p>
               </div>
               <div className="detail-item">
                  <span className="label">Mobile Number</span>
                  <p className="value">{user?.mobile || 'Not provided'}</p>
               </div>
               <div className="detail-item">
                  <span className="label">Gender</span>
                  <p className="value">{user?.gender || 'Not specified'}</p>
               </div>
            </div>
          </section>

          {/* Addresses Section */}
          <section className="profile-section mt-10">
             <div className="section-header mb-4">
                <h3>Default Address</h3>
                <button className="btn-add-address-small" onClick={() => navigate('/checkout')}>ADD NEW ADDRESS</button>
             </div>
             <div className="address-list-compact">
                {addresses.length > 0 ? (
                  addresses.map(addr => (
                    <div key={addr._id} className="address-row-card">
                      <div className="addr-main">
                         <div className="addr-top">
                            <span className="addr-name">{addr.fullName}</span>
                            <span className="addr-badge">{addr.isDefault ? 'DEFAULT' : 'HOME'}</span>
                         </div>
                         <p className="addr-body">{addr.houseName}, {addr.locality}, {addr.city}, {addr.state} - {addr.pincode}</p>
                         <p className="addr-contact">Mobile: <span>{addr.mobile}</span></p>
                      </div>
                      <div className="addr-row-actions">
                         <button className="btn-text" onClick={() => removeAddress(addr._id)}>REMOVE</button>
                         <button className="btn-text-primary">EDIT</button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="empty-addresses">
                     <p>No saved addresses found. Add one to speed up checkout.</p>
                  </div>
                )}
             </div>
          </section>
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
