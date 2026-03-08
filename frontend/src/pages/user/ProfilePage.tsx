import React from 'react';
import { useLocation } from 'react-router-dom';
import ProfileSidebar from '../../components/user/profile/ProfileSidebar';
import ProfileOverview from '../../components/user/profile/ProfileOverview';
import ProfileEdit from '../../components/user/profile/ProfileEdit';
import ProfileCoupons from '../../components/user/profile/ProfileCoupons';
import ProfileSavedCards from '../../components/user/profile/ProfileSavedCards';
import ProfileSavedUPI from '../../components/user/profile/ProfileSavedUPI';
import ProfileSavedWallets from '../../components/user/profile/ProfileSavedWallets';
import ProfileAddresses from '../../components/user/profile/ProfileAddresses';
import ProfileDeleteAccount from '../../components/user/profile/ProfileDeleteAccount';
import ProfileStatic from '../../components/user/profile/ProfileStatic';
import './ProfilePage.css';

const ProfilePage: React.FC = () => {
  const location = useLocation();
  const searchParams = new URLSearchParams(location.search);
  const tab = searchParams.get('tab') || 'edit';

  const renderContent = () => {
    switch (tab) {
      case 'overview': return <ProfileOverview />;
      case 'edit': return <ProfileEdit />;
      case 'coupons': return <ProfileCoupons />;
      case 'cards': return <ProfileSavedCards />;
      case 'upi': return <ProfileSavedUPI />;
      case 'wallets': return <ProfileSavedWallets />;
      case 'addresses': return <ProfileAddresses />;
      case 'delete': return <ProfileDeleteAccount />;
      case 'myncash':
        return <ProfileStatic title="MynCash" content="Your MynCash balance allows you to pay for parts of your order using reward points. Keep shopping to earn more!" />;
      case 'credit':
        return <ProfileStatic title="Myntra Credit" content="Myntra Credit is a swift, secure, and hassle-free way to manage your refunds and wallet balance." />;
      case 'insider':
        return <ProfileStatic title="Myntra Insider" content="Welcome to the Elite club! Get early access to sales, exclusive rewards, and priority customer support." />;
      case 'terms':
        return <ProfileStatic title="Terms of Use" content="These terms govern your use of our website. By accessing or using the platform, you agree to be bound by these policies..." />;
      case 'privacy':
        return <ProfileStatic title="Privacy Policy" content="We respect your privacy. All your data including saved cards and addresses are encrypted and stored securely." />;
      default: return <ProfileEdit />;
    }
  };

  return (
    <div className="profile-page container">
      <div className="profile-layout">
        <ProfileSidebar />
        <main className="profile-main">
          {renderContent()}
        </main>
      </div>
    </div>
  );
};

export default ProfilePage;
