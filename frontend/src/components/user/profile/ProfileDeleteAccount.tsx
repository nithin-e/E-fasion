import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import { toast } from '../../../hooks/useToast';
import api from '../../../api/axios';
import './ProfilePayments.css'; // Reusing pane styles

const ProfileDeleteAccount: React.FC = () => {
  const { logout } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);
  const [confirmText, setConfirmText] = useState('');

  const handleDelete = async () => {
    if (confirmText !== 'DELETE') {
      toast.error('Please type DELETE to confirm');
      return;
    }

    if (window.confirm('Are you absolutely sure? This action cannot be undone.')) {
      setLoading(true);
      try {
        await api.delete('/users/account');
        await logout();
        toast.success('Your account has been deleted');
        navigate('/');
      } catch (err: any) {
        toast.error(err.response?.data?.message || 'Failed to delete account');
        setLoading(false);
      }
    }
  };

  return (
    <div className="profile-payments-pane">
      <h3 className="pane-title text-danger" style={{ color: '#ff3f6c' }}>Delete Account</h3>
      <div className="divider" style={{ margin: '20px 0' }} />

      <div style={{ maxWidth: '500px' }}>
        <p style={{ fontSize: '14px', color: '#535766', marginBottom: '20px', lineHeight: '1.5' }}>
          Deleting your account will remove all of your orders, saved addresses, saved payment methods, and profile details permanently. This action cannot be reversed.
        </p>

        <p style={{ fontSize: '13px', color: '#282c3f', fontWeight: '700', marginBottom: '8px' }}>
          To confirm, type "DELETE" below:
        </p>
        <input 
          type="text" 
          value={confirmText}
          onChange={(e) => setConfirmText(e.target.value)}
          placeholder="Type DELETE" 
          className="input-field" 
          style={{ width: '100%', marginBottom: '20px' }}
        />

        <button 
          className="btn-save-payment" 
          style={{ background: '#ff3f6c' }}
          onClick={handleDelete}
          disabled={loading || confirmText !== 'DELETE'}
        >
          {loading ? 'DELETING...' : 'DELETE MY ACCOUNT'}
        </button>
      </div>
    </div>
  );
};

export default ProfileDeleteAccount;
