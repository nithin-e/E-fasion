import React from 'react';
import { useAuth } from '../../../context/AuthContext';
import './ProfileOverview.css';

const ProfileOverview: React.FC = () => {
  const { user } = useAuth();
  
  if (!user) return null;

  return (
    <div className="profile-overview">
      <div className="overview-header">
        <div className="user-avatar-large">{(user.name || 'U')[0]}</div>
        <div className="user-meta-large">
          <p className="user-name-large">{user.name}</p>
          <p className="user-email-large">{user.email}</p>
        </div>
      </div>

      <div className="overview-stats-grid">
        <div className="stat-card">
          <h4>E-FASHION WALLET</h4>
          <p className="stat-value">₹{user.wallet || 0}</p>
          <span className="stat-label">Wallet Balance</span>
        </div>
        
        <div className="stat-card">
          <h4>MYNCASH</h4>
          <p className="stat-value">₹{user.mynCash || 0}</p>
          <span className="stat-label">Available</span>
        </div>
      </div>
    </div>
  );
};

export default ProfileOverview;
