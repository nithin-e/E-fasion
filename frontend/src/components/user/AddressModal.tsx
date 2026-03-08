import React, { useState, useEffect } from 'react';
import { addAddressApi } from '../../api/userApi';
import api from '../../api/axios';
import { toast } from '../../hooks/useToast';
import type { Address } from '../../types';
import MapLocationSelector from './MapLocationSelector';
import './AddressModal.css';

interface AddressModalProps {
  onClose: () => void;
  onSuccess: (newAddress: Address) => void;
}

type ModalStage = 'LOADING' | 'UNSERVICEABLE' | 'FORM';

const AddressModal: React.FC<AddressModalProps> = ({ onClose, onSuccess }) => {
  const [stage, setStage] = useState<ModalStage>('LOADING');
  const [loading, setLoading] = useState(false);
  const [coords, setCoords] = useState<{lat: number, lng: number} | null>(null);
  
  const [formData, setFormData] = useState({
    fullName: '',
    mobile: '',
    pincode: '',
    houseName: '',
    locality: '',
    city: '',
    state: '',
  });

  // Automatically check default location on mount
  useEffect(() => {
    const defaultCoords = { lat: 12.9988, lng: 77.5921 }; // Bangalore Palace
    handleLocationChange(defaultCoords.lat, defaultCoords.lng);
  }, []);

  const handleLocationChange = async (lat: number, lng: number) => {
    setLoading(true);
    setStage('LOADING');
    try {
      // 1. Check Serviceability
      const res = await api.get(`/delivery/check-serviceable?lat=${lat}&lng=${lng}`);
      
      if (!res.data.isServiceable) {
        setStage('UNSERVICEABLE');
        setLoading(false);
        return;
      }

      setCoords({ lat, lng });

      // 2. Reverse Geocode 
      try {
        const geoRes = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`);
        const geoData = await geoRes.json();
        const address = geoData.address;

        setFormData(prev => ({
          ...prev,
          pincode: address?.postcode || '',
          locality: address?.suburb || address?.neighbourhood || address?.road || '',
          city: address?.city || address?.town || address?.county || '',
          state: address?.state || '',
        }));
      } catch (geoErr) {
        console.warn('Reverse geocoding failed', geoErr);
      }

      setStage('FORM');
    } catch (err: any) {
      toast.error('Failed to verify location serviceability');
      setStage('UNSERVICEABLE');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coords) return;

    setLoading(true);
    try {
      const res = await addAddressApi({
        ...formData,
        isDefault: false,
        lat: coords.lat,
        lng: coords.lng
      });
      toast.success('Address added successfully');
      onSuccess(res.data.address || res.data);
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to add address');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="address-modal-overlay">
      <div className="address-split-container">
        
        {/* LEFT PANE: MAP */}
        <div className="address-left-pane">
          <MapLocationSelector 
            onLocationChange={handleLocationChange} 
          />
        </div>

        {/* RIGHT PANE: DYNAMIC */}
        <div className="address-right-pane">
          <button className="split-btn-close" onClick={onClose}>✕</button>

          {stage === 'LOADING' && (
             <div className="split-center-content">
                <h3 style={{color: '#696b79'}}>Checking Location...</h3>
                <div className="loader-spinner"></div>
             </div>
          )}

          {stage === 'UNSERVICEABLE' && (
             <div className="unserviceable-content split-center-content">
               <img src="https://cdn.grofers.com/cdn-cgi/image/f=auto,fit=scale-down,q=70,metadata=none,w=900/assets/resources/2021-08/oops.png" alt="Oops" style={{width: '200px', marginBottom: '20px'}} />
               <h3 style={{fontSize: '20px', fontWeight: 700, marginBottom: '10px'}}>Oops!</h3>
               <p style={{color: '#535766', fontSize: '14px', lineHeight: '1.5', textAlign: 'center', marginBottom: '20px'}}>
                 Blinkit is not available at this location at the moment. Please select a different location.
               </p>
               <p style={{fontSize: '12px', color: '#ff3f6c', fontWeight: 600}}>Tip: Search & Drag pin within Bangalore border</p>
             </div>
          )}

          {stage === 'FORM' && (
            <div className="form-content">
              <div className="address-modal-header split-header">
                <h3>Enter complete address</h3>
              </div>
              
              <form onSubmit={handleSubmit} className="address-modal-body">
                <div className="location-context">
                  <p className="location-context-title">Delivering your order to</p>
                  <p className="location-context-details">{formData.locality ? `${formData.locality}, ` : ''}{formData.city}</p>
                </div>

                <div className="form-section">
                  <div className="input-group">
                     <input type="text" name="fullName" placeholder="Your Name*" required value={formData.fullName} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                     <input type="tel" name="mobile" placeholder="Mobile Number*" required value={formData.mobile} onChange={handleChange} maxLength={10} />
                  </div>
                  <div className="input-group">
                     <input type="text" name="houseName" placeholder="Flat / House no / Building name*" required value={formData.houseName} onChange={handleChange} />
                  </div>
                  <div className="input-group">
                     <input type="text" name="locality" placeholder="Area / Sector / Locality*" required value={formData.locality} onChange={handleChange} />
                  </div>
                  
                  <div className="input-row">
                     <div className="input-group half">
                        <input type="text" name="city" placeholder="City / District*" required value={formData.city} onChange={handleChange} />
                     </div>
                     <div className="input-group half">
                        <input type="text" name="pincode" placeholder="Pin Code*" required value={formData.pincode} onChange={handleChange} maxLength={6} />
                     </div>
                  </div>
                   <div className="input-group" style={{marginTop: '10px'}}>
                        <input type="text" name="state" placeholder="State*" required value={formData.state} onChange={handleChange} />
                   </div>
                </div>

                <div className="address-modal-footer">
                  <button type="submit" className="btn-save" style={{background: '#0c831f'}} disabled={loading}>
                    {loading ? 'Saving...' : 'Save Address'}
                  </button>
                </div>
              </form>
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default AddressModal;
