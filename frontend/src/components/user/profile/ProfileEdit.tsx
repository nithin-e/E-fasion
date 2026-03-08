import React, { useState, useEffect } from 'react';
import { useAuth } from '../../../context/AuthContext';
import { toast } from '../../../hooks/useToast';
import api from '../../../api/axios';
import './ProfileEdit.css';

const ProfileEdit: React.FC = () => {
  const { user, refetchUser } = useAuth();
  
  const [formData, setFormData] = useState({
    name: '',
    mobile: '',
    email: '',
    gender: '',
    birthday: '',
    alternateMobile: ''
  });
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name || '',
        mobile: user.mobile || '',
        email: user.email || '',
        gender: user.gender || '',
        birthday: user.birthday ? new Date(user.birthday).toISOString().split('T')[0] : '',
        alternateMobile: user.alternateMobile || ''
      });
    }
  }, [user]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleGenderChange = (gender: string) => {
    setFormData({ ...formData, gender });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      await api.put('/users/profile', formData);
      await refetchUser();
      toast.success('Profile details saved successfully');
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to update profile');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="profile-edit-pane">
      <h3 className="pane-title">Edit Details</h3>
      <div className="divider" style={{ margin: '20px 0' }} />

      <form className="profile-edit-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label className="input-label">Mobile Number*</label>
          <input 
            type="text" 
            name="mobile" 
            value={formData.mobile} 
            onChange={handleChange}
            className="input-field" 
            required
            readOnly // Typically mobile can't be changed without OTP, but adhering to prompt: just a field
          />
        </div>

        <div className="form-group">
          <label className="input-label">Full Name*</label>
          <input 
            type="text" 
            name="name" 
            value={formData.name} 
            onChange={handleChange}
            className="input-field" 
            required
          />
        </div>

        <div className="form-group">
          <label className="input-label">Email*</label>
          <input 
            type="email" 
            name="email" 
            value={formData.email} 
            onChange={handleChange}
            className="input-field" 
            required
          />
        </div>

        <div className="form-group">
          <label className="input-label">Gender</label>
          <div className="gender-toggles">
            <button 
              type="button" 
              className={`gender-btn ${formData.gender === 'Female' ? 'active' : ''}`}
              onClick={() => handleGenderChange('Female')}
            >
              Female
            </button>
            <button 
              type="button" 
              className={`gender-btn ${formData.gender === 'Male' ? 'active' : ''}`}
              onClick={() => handleGenderChange('Male')}
            >
              Male
            </button>
          </div>
        </div>

        <div className="form-group">
          <label className="input-label">Date of Birth</label>
          <input 
            type="date" 
            name="birthday" 
            value={formData.birthday} 
            onChange={handleChange}
            className="input-field" 
          />
          <span className="input-hint">Please enter your DOB in DD/MM/YYYY format</span>
        </div>

        <div className="form-group alternate-details">
          <p className="alternate-title">Alternate Details</p>
          <div className="form-group mt-3">
            <label className="input-label">Alternate Mobile</label>
            <input 
              type="text" 
              name="alternateMobile" 
              value={formData.alternateMobile} 
              onChange={handleChange}
              className="input-field" 
            />
          </div>
        </div>

        <button type="submit" className="btn-save-details" disabled={loading}>
          {loading ? 'SAVING...' : 'SAVE DETAILS'}
        </button>
      </form>
    </div>
  );
};

export default ProfileEdit;
