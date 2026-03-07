import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { toast } from '../../hooks/useToast';
import { Plus, Trash2, Image as ImageIcon, ExternalLink } from 'lucide-react';
import './AdminCommon.css';

const AdminBanners: React.FC = () => {
  const [banners, setBanners] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ title: '', description: '', link: '', priority: 0, image: null as File | null });

  const fetchBanners = async () => {
    try {
      const res = await axios.get('/admin/banners');
      setBanners(res.data.banners);
    } catch (err) {
      toast.error('Failed to fetch banners');
    }
  };

  useEffect(() => {
    fetchBanners();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.image) return toast.error('Banner image is required');
    
    setIsLoading(true);
    const data = new FormData();
    data.append('title', formData.title);
    data.append('description', formData.description);
    data.append('link', formData.link);
    data.append('priority', formData.priority.toString());
    data.append('image', formData.image);

    try {
      await axios.post('/admin/banners', data);
      toast.success('Banner uploaded successfully');
      setShowModal(false);
      setFormData({ title: '', description: '', link: '', priority: 0, image: null });
      fetchBanners();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Failed to create banner');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to remove this banner?')) return;
    try {
      await axios.delete(`/admin/banners/${id}`);
      toast.success('Banner removed');
      fetchBanners();
    } catch (err) {
      toast.error('Failed to delete banner');
    }
  };

  return (
    <div className="admin-management-page">
      <div className="admin-header">
        <div>
          <h2>Home Banners</h2>
          <p style={{ color: '#7e818c', fontSize: '14px' }}>Control the main carousel on the home page</p>
        </div>
        <button className="modal-actions button[type='submit']" style={{ 
          background: '#282c3f', color: '#fff', border: 'none', padding: '12px 20px', 
          borderRadius: '4px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' 
        }} onClick={() => setShowModal(true)}>
          <Plus size={18} /> Add Promo Banner
        </button>
      </div>

      <div className="banners-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: '25px', marginTop: '20px' }}>
        {banners.map((banner) => (
          <div key={banner._id} className="banner-admin-card" style={{ background: '#fff', border: '1px solid #eaeaec', borderRadius: '12px', overflow: 'hidden', boxShadow: '0 4px 15px rgba(0,0,0,0.05)' }}>
            <div style={{ position: 'relative', height: '160px' }}>
              <img src={banner.image} alt={banner.title} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
              <div style={{ position: 'absolute', top: '10px', right: '10px', background: 'rgba(0,0,0,0.6)', color: '#fff', padding: '4px 8px', borderRadius: '4px', fontSize: '11px', fontWeight: '700' }}>
                PRIORITY: {banner.priority}
              </div>
            </div>
            <div style={{ padding: '20px' }}>
              <h4 style={{ fontSize: '16px', fontWeight: '700', marginBottom: '8px', color: '#282c3f' }}>{banner.title || 'Untitled Banner'}</h4>
              <p style={{ fontSize: '13px', color: '#7e818c', marginBottom: '15px' }}>{banner.description || 'No description provided'}</p>
              
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#f5f5f6', padding: '8px 12px', borderRadius: '6px', marginBottom: '20px' }}>
                <ExternalLink size={14} color="#7e818c" />
                <span style={{ fontSize: '12px', color: '#282c3f', fontWeight: '600', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{banner.link}</span>
              </div>

              <button 
                onClick={() => handleDelete(banner._id)} 
                style={{ width: '100%', color: '#ff3f6c', background: '#fff', border: '1px solid #ff3f6c', padding: '10px', borderRadius: '6px', cursor: 'pointer', fontWeight: '700', transition: 'all 0.2s' }}
                onMouseOver={(e) => { e.currentTarget.style.background = '#ff3f6c'; e.currentTarget.style.color = '#fff'; }}
                onMouseOut={(e) => { e.currentTarget.style.background = '#fff'; e.currentTarget.style.color = '#ff3f6c'; }}
              >
                <Trash2 size={16} style={{ marginBottom: '-3px', marginRight: '5px' }} /> Remove Banner
              </button>
            </div>
          </div>
        ))}
        {banners.length === 0 && (
          <div style={{ gridColumn: '1 / -1', textAlign: 'center', padding: '60px', background: '#f5f5f6', borderRadius: '12px', border: '2px dashed #d4d5d9' }}>
             <ImageIcon size={48} color="#ccc" style={{ marginBottom: '15px' }} />
             <h4 style={{ color: '#282c3f' }}>No Active Banners</h4>
             <p style={{ color: '#7e818c', fontSize: '14px' }}>Upload eye-catching banners to grab user attention on the home page.</p>
          </div>
        )}
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: '550px' }}>
            <h3>Upload Promo Banner</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Banner Title</label>
                <input type="text" placeholder="e.g. Summer Collection 2024" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Sub-text / Description</label>
                <input type="text" placeholder="e.g. Up to 50% OFF on all items" value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} />
              </div>
              <div className="form-group">
                <label>Redirect URL / Shop Link</label>
                <input type="text" placeholder="/shop?category=ethnic" value={formData.link} onChange={(e) => setFormData({ ...formData, link: e.target.value })} required />
              </div>
              <div className="form-group">
                <label>Display Priority (Higher = First)</label>
                <input type="number" value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: parseInt(e.target.value) })} />
              </div>
              <div className="form-group">
                <label>Banner Image (Recommended 16:9 or Wide)</label>
                <div style={{ border: '1px dashed #d4d5d9', padding: '30px', borderRadius: '4px', textAlign: 'center', cursor: 'pointer', position: 'relative', background: '#f9f9f9' }}>
                  <input 
                    type="file" 
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    onChange={(e) => setFormData({ ...formData, image: e.target.files?.[0] || null })} 
                    required={!banners.length}
                  />
                  {formData.image ? (
                    <span style={{ fontSize: '14px', color: '#ff3f6c', fontWeight: '600' }}>{formData.image.name} selected</span>
                  ) : (
                    <div style={{ color: '#7e818c' }}>
                      <ImageIcon size={32} style={{ marginBottom: '10px' }} />
                      <p style={{ fontSize: '14px' }}>Click to select or drag banner image here</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>Discard</button>
                <button type="submit" disabled={isLoading} className="btn-primary">
                  {isLoading ? 'Uploading...' : 'Publish Banner'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBanners;
