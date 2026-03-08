import React from 'react';
import { NavLink } from 'react-router-dom';
import './ProfileSidebar.css';

const ProfileSidebar: React.FC = () => {
  return (
    <aside className="profile-sidebar">
      <div className="sidebar-group">
        <div className="nav-group">
          <NavLink to="/profile?tab=overview" className={`nav-item ${window.location.search.includes('tab=overview') ? 'active' : ''}`}>Overview</NavLink>
        </div>

        <div className="divider-nav" />

        <div className="nav-group">
          <p className="nav-group-title">ORDERS</p>
          <NavLink to="/orders" className="nav-item">Orders & Returns</NavLink>
        </div>

        <div className="divider-nav" />

        <div className="nav-group">
          <p className="nav-group-title">CREDITS</p>
          <NavLink to="/profile?tab=coupons" className={`nav-item ${window.location.search.includes('tab=coupons') ? 'active' : ''}`}>Coupons</NavLink>
          <NavLink to="/profile?tab=credit" className={`nav-item ${window.location.search.includes('tab=credit') ? 'active' : ''}`}>Myntra Credit</NavLink>
          <NavLink to="/profile?tab=myncash" className={`nav-item ${window.location.search.includes('tab=myncash') ? 'active' : ''}`}>MynCash</NavLink>
        </div>

        <div className="divider-nav" />

        <div className="nav-group">
          <p className="nav-group-title">ACCOUNT</p>
          <NavLink to="/profile?tab=edit" className={`nav-item ${window.location.search.includes('tab=edit') || !window.location.search ? 'active' : ''}`}>Profile</NavLink>
          <NavLink to="/profile?tab=cards" className={`nav-item ${window.location.search.includes('tab=cards') ? 'active' : ''}`}>Saved Cards</NavLink>
          <NavLink to="/profile?tab=upi" className={`nav-item ${window.location.search.includes('tab=upi') ? 'active' : ''}`}>Saved VPA</NavLink>
          <NavLink to="/profile?tab=addresses" className={`nav-item ${window.location.search.includes('tab=addresses') ? 'active' : ''}`}>Addresses</NavLink>
          <NavLink to="/profile?tab=insider" className={`nav-item ${window.location.search.includes('tab=insider') ? 'active' : ''}`}>Myntra Insider</NavLink>
          <NavLink to="/profile?tab=delete" className={`nav-item ${window.location.search.includes('tab=delete') ? 'active' : ''} text-danger`}>Delete Account</NavLink>
        </div>

        <div className="divider-nav" />

        <div className="nav-group">
          <p className="nav-group-title">LEGAL</p>
          <NavLink to="/profile?tab=terms" className={`nav-item ${window.location.search.includes('tab=terms') ? 'active' : ''}`}>Terms of Use</NavLink>
          <NavLink to="/profile?tab=privacy" className={`nav-item ${window.location.search.includes('tab=privacy') ? 'active' : ''}`}>Privacy Policy</NavLink>
        </div>
      </div>
    </aside>
  );
};

export default ProfileSidebar;
