import React, { useEffect, useState } from 'react';
import axios from '../../api/axios';
import { toast } from '../../hooks/useToast';
import { Plus, Trash2, Edit, Image as ImageIcon } from 'lucide-react';
import './AdminCommon.css';

const AdminBrands: React.FC = () => {
  const [brands, setBrands] = useState<any[]>([]);
  const [showModal, setShowModal] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({ name: '', description: '', logo: null as File | null });
  const [editingId, setEditingId] = useState<string | null>(null);

  const fetchBrands = async () => {
    try {
      const res = await axios.get('/admin/brands');
      setBrands(res.data.brands);
    } catch (err) {
      toast.error('Failed to fetch brands');
    }
  };

  useEffect(() => {
    fetchBrands();
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    const data = new FormData();
    data.append('name', formData.name);
    data.append('description', formData.description);
    if (formData.logo) data.append('logo', formData.logo);

    try {
      if (editingId) {
        await axios.put(`/admin/brands/${editingId}`, data);
        toast.success('Brand updated successfully');
      } else {
        await axios.post('/admin/brands', data);
        toast.success('Brand created successfully');
      }
      setShowModal(false);
      setEditingId(null);
      setFormData({ name: '', description: '', logo: null });
      fetchBrands();
    } catch (err: any) {
      toast.error(err.response?.data?.message || 'Operation failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this brand?')) return;
    try {
      await axios.delete(`/admin/brands/${id}`);
      toast.success('Brand deleted successfully');
      fetchBrands();
    } catch (err) {
      toast.error('Failed to delete brand');
    }
  };

  return (
    <div className="admin-management-page">
      <div className="admin-header">
        <div>
          <h2>Brands</h2>
          <p style={{ color: '#7e818c', fontSize: '14px' }}>Manage partner brands and their logos</p>
        </div>
        <button className="modal-actions button[type='submit']" style={{ 
          background: '#282c3f', color: '#fff', border: 'none', padding: '12px 20px', 
          borderRadius: '4px', fontWeight: '700', display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer' 
        }} onClick={() => { setShowModal(true); setEditingId(null); setFormData({ name: '', description: '', logo: null }); }}>
          <Plus size={18} /> Add New Brand
        </button>
      </div>

      <div className="admin-table-container">
        <table className="admin-table">
          <thead>
            <tr>
              <th style={{ width: '80px' }}>Logo</th>
              <th>Brand Name</th>
              <th>Description</th>
              <th style={{ width: '120px' }}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {brands.map((brand) => (
              <tr key={brand._id}>
                <td>
                  <div style={{ width: '50px', height: '50px', background: '#f9f9f9', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', border: '1px solid #f0f0f5' }}>
                    {brand.logo ? (
                      <img src={brand.logo} alt={brand.name} style={{ width: '100%', height: '100%', objectFit: 'contain' }} />
                    ) : (
                      <ImageIcon size={20} color="#ccc" />
                    )}
                  </div>
                </td>
                <td style={{ fontWeight: '600' }}>{brand.name}</td>
                <td style={{ color: '#535766' }}>{brand.description || 'No description provided'}</td>
                <td className="actions">
                  <button onClick={() => { 
                    setEditingId(brand._id); 
                    setFormData({ name: brand.name, description: brand.description || '', logo: null }); 
                    setShowModal(true); 
                  }} title="Edit"><Edit size={16} /></button>
                  <button onClick={() => handleDelete(brand._id)} className="delete" title="Delete"><Trash2 size={16} /></button>
                </td>
              </tr>
            ))}
            {brands.length === 0 && (
              <tr>
                <td colSpan={4} style={{ textAlign: 'center', padding: '40px', color: '#7e818c' }}>
                  No brands found. Click "Add New Brand" to get started.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {showModal && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <h3>{editingId ? 'Edit Brand' : 'Create New Brand'}</h3>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Brand Name</label>
                <input 
                  type="text" 
                  placeholder="e.g. Nike, Zara, H&M"
                  value={formData.name} 
                  onChange={(e) => setFormData({ ...formData, name: e.target.value })} 
                  required 
                />
              </div>
              <div className="form-group">
                <label>Description (Optional)</label>
                <textarea 
                  placeholder="Briefly describe the brand..."
                  rows={3}
                  value={formData.description} 
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })} 
                />
              </div>
              <div className="form-group">
                <label>Brand Logo {editingId ? '(Leave empty to keep current)' : ''}</label>
                <div style={{ border: '1px dashed #d4d5d9', padding: '20px', borderRadius: '4px', textAlign: 'center', cursor: 'pointer', position: 'relative' }}>
                  <input 
                    type="file" 
                    accept="image/*"
                    style={{ position: 'absolute', inset: 0, opacity: 0, cursor: 'pointer' }}
                    onChange={(e) => setFormData({ ...formData, logo: e.target.files?.[0] || null })} 
                  />
                  {formData.logo ? (
                    <span style={{ fontSize: '14px', color: '#ff3f6c', fontWeight: '600' }}>{formData.logo.name} selected</span>
                  ) : (
                    <div style={{ color: '#7e818c' }}>
                      <ImageIcon size={24} style={{ marginBottom: '8px' }} />
                      <p style={{ fontSize: '13px' }}>Click or drag to upload logo</p>
                    </div>
                  )}
                </div>
              </div>
              <div className="modal-actions">
                <button type="button" onClick={() => setShowModal(false)}>Cancel</button>
                <button type="submit" disabled={isLoading} className="btn-primary">
                  {isLoading ? 'Saving...' : 'Save Brand'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminBrands;
