import React, { useState } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from '../../../hooks/useToast';
import api from '../../../api/axios';
import './ProfilePayments.css';

const ProfileSavedCards: React.FC = () => {
  const { user, refetchUser } = useAuth();
  const [showAddForm, setShowAddForm] = useState(false);
  const [formData, setFormData] = useState({
    cardNumber: '',
    cardName: '',
    expiry: '',
    cardType: 'Visa'
  });
  const [loading, setLoading] = useState(false);

  const cards = user?.savedCards || [];

  const handleAddCard = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      // Masking the card for display
      const maskedCard = `**** **** **** ${formData.cardNumber.slice(-4)}`;
      await api.post('/users/saved-cards', { ...formData, cardNumber: maskedCard });
      await refetchUser();
      toast.success('Card added successfully');
      setShowAddForm(false);
      setFormData({ cardNumber: '', cardName: '', expiry: '', cardType: 'Visa' });
    } catch (err) {
      toast.error('Failed to add card');
    } finally {
      setLoading(false);
    }
  };

  const removeCard = async (id: string) => {
    try {
      await api.delete(`/users/saved-cards/${id}`);
      await refetchUser();
      toast.success('Card removed');
    } catch (err) {
      toast.error('Failed to remove card');
    }
  };

  return (
    <div className="profile-payments-pane">
      <div className="pane-header">
        <h3 className="pane-title">Saved Cards</h3>
        {!showAddForm && (
          <button className="btn-add-payment" onClick={() => setShowAddForm(true)}>+ ADD NEW CARD</button>
        )}
      </div>
      <div className="divider" style={{ margin: '20px 0' }} />

      {showAddForm ? (
        <form className="payment-form" onSubmit={handleAddCard}>
          <div className="form-group grid-2">
            <input type="text" placeholder="Card Number (16 digits)" maxLength={16} required value={formData.cardNumber} onChange={e => setFormData({...formData, cardNumber: e.target.value})} className="input-field" />
            <input type="text" placeholder="Name on Card" required value={formData.cardName} onChange={e => setFormData({...formData, cardName: e.target.value})} className="input-field" />
            <input type="text" placeholder="Expiry (MM/YY)" required value={formData.expiry} onChange={e => setFormData({...formData, expiry: e.target.value})} className="input-field" />
            <select value={formData.cardType} onChange={e => setFormData({...formData, cardType: e.target.value})} className="input-field">
              <option value="Visa">Visa</option>
              <option value="Mastercard">Mastercard</option>
              <option value="RuPay">RuPay</option>
            </select>
          </div>
          <div className="payment-form-actions">
            <button type="submit" className="btn-save-payment" disabled={loading}>{loading ? 'ADDING...' : 'ADD CARD'}</button>
            <button type="button" className="btn-cancel-payment" onClick={() => setShowAddForm(false)}>CANCEL</button>
          </div>
        </form>
      ) : (
        <div className="saved-items-list">
          {cards.length === 0 ? (
            <p className="empty-payments">No saved cards found.</p>
          ) : (
            cards.map(card => (
              <div key={card._id} className="payment-card-item">
                <div className="payment-card-icon">{card.cardType}</div>
                <div className="payment-card-details">
                  <p className="payment-card-number">{card.cardNumber}</p>
                  <p className="payment-card-name">{card.cardName}</p>
                </div>
                <button className="btn-remove-payment" onClick={() => removeCard(card._id!)}>REMOVE</button>
              </div>
            ))
          )}
        </div>
      )}
    </div>
  );
};

export default ProfileSavedCards;
