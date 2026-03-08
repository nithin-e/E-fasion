import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from '../../../hooks/useToast';
import api from '../../../api/axios';
import './ProfilePayments.css';

const ProfileSavedUPI: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({ upiId: '', appName: 'GPay' });
  const [loading, setLoading] = useState(false);

  const upis = user?.savedUPI || [];

  const handleAddUPI = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.post('/users/saved-upi', formData);
      await refetchUser();
      toast.success('UPI ID added successfully');
      setShowAddForm(false);
      setFormData({ upiId: '', appName: 'GPay' });
    } catch (err) {
      toast.error('Failed to add UPI ID');
    } finally {
      setLoading(false);
    }
  };

  const removeUPI = async (id: string) => {
    try {
      await api.delete(`/users/saved-upi/${id}`);
      await refetchUser();
      toast.success('UPI ID removed');
    } catch (err) {
      toast.error('Failed to remove UPI ID');
    }
  };

  return (
    <div className="profile-payments-pane">
      <div className="pane-header">
        <h3 className="pane-title">Saved VPA (UPI)</h3>
        {!showAddForm && (
          <button className="btn-add-payment" onClick={() => setShowAddForm(true)}>+ ADD NEW UPI</button>
        )}
      </div>
      <div className="divider" style={{ margin: '20px 0' }} />

      {showAddForm ? (
        <form className="payment-form" onSubmit={handleAddUPI}>
          <div className="form-group grid-2">
            <input type="text" placeholder="UPI ID (e.g. user@okhdfc)" required value={formData.upiId} onChange={e => setFormData({...formData, upiId: e.target.value})} className="input-field" />
            <select value={formData.appName} onChange={e => setFormData({...formData, appName: e.target.value})} className="input-field">
              <option value="GPay">GPay</option>
              <option value="PhonePe">PhonePe</option>
              <option value="Paytm">Paytm</option>
            </select>
          </div>
          <div className="payment-form-actions">
            <button type="submit" className="btn-save-payment" disabled={loading}>{loading ? 'ADDING...' : 'ADD UPI'}</button>
            <button type="button" className="btn-cancel-payment" onClick={() => setShowAddForm(false)}>CANCEL</button>
          </div>
        </form>
      ) : (
        <div className="saved-items-list">
          {upis.length === 0 ? (
            <p className="empty-payments">No saved UPI IDs found.</p>
          ) : (
            upis.map(upi => (
              <div key={upi._id} className="payment-card-item">
                <div className="payment-card-icon">{upi.appName}</div>
                <div className="payment-card-details">
                  <p className="payment-card-number">{upi.upiId}</p>
                </div>
                <button className="btn-remove-payment" onClick={() => removeUPI(upi._id!)}>REMOVE</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileSavedUPI;
