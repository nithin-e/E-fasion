import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from '../../../hooks/useToast';
import api from '../../../api/axios';
import './ProfilePayments.css';

const ProfileSavedWallets: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ walletName: 'Paytm', linkedNumber: '' });
  const [loading, setLoading] = useState(false);

  const wallets = user?.savedWallets || [];

  const handleAddWallet = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users/saved-wallets', formData);
      await refetchUser();
      toast.success('Wallet added successfully');
      setShowAddForm(false);
      setFormData({ walletName: 'Paytm', linkedNumber: '' });
    } catch (err) {
      toast.error('Failed to add wallet');
    } finally {
      setLoading(false);
    }
  };

  const removeWallet = async (id: string) => {
    try {
      await api.delete(`/users/saved-wallets/${id}`);
      await refetchUser();
      toast.success('Wallet removed');
    } catch (err) {
      toast.error('Failed to remove wallet');
    }
  };

  return (
    <div className="profile-payments-pane">
      <div className="pane-header">
        <h3 className="pane-title">Saved Wallets</h3>
        {!showAddForm && (
          <button className="btn-add-payment" onClick={() => setShowAddForm(true)}>+ LINK NEW WALLET</button>
        )}
      </div>
      <div className="divider" style={{ margin: '20px 0' }} />

      {showAddForm ? (
        <form className="payment-form" onSubmit={handleAddWallet}>
          <div className="form-group grid-2">
            <select value={formData.walletName} onChange={e => setFormData({...formData, walletName: e.target.value})} className="input-field">
              <option value="Paytm">Paytm</option>
              <option value="PhonePe">PhonePe</option>
              <option value="Amazon Pay">Amazon Pay</option>
              <option value="Mobikwik">Mobikwik</option>
            </select>
            <input type="text" placeholder="Linked Mobile Number" required value={formData.linkedNumber} onChange={e => setFormData({...formData, linkedNumber: e.target.value})} className="input-field" maxLength={10} />
          </div>
          <div className="payment-form-actions">
            <button type="submit" className="btn-save-payment" disabled={loading}>{loading ? 'LINKING...' : 'LINK WALLET'}</button>
            <button type="button" className="btn-cancel-payment" onClick={() => setShowAddForm(false)}>CANCEL</button>
          </div>
        </form>
      ) : (
        <div className="saved-items-list">
          {wallets.length === 0 ? (
            <p className="empty-payments">No saved wallets found.</p>
          ) : (
            wallets.map(wallet => (
              <div key={wallet._id} className="payment-card-item">
                <div className="payment-card-icon">{wallet.walletName}</div>
                <div className="payment-card-details">
                  <p className="payment-card-number">Linked to: {wallet.linkedNumber}</p>
                </div>
                <button className="btn-remove-payment" onClick={() => removeWallet(wallet._id!)}>UNLINK</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileSavedWallets;
