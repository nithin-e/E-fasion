import React, { useEffect, useState } from 'react';
import { Plus, Edit2, Trash2, X, Image as ImageIcon } from 'lucide-react';
import { getCategoriesApi, addCategoryApi, editCategoryApi, deleteCategoryApi } from '../../api/productApi';
import { toast } from '../../hooks/useToast';
import './AdminCommon.css';

interface Category {
  _id: string;
  name: string;
  description: string;
  image: string;
  slug: string;
}

const AdminCategories: React.FC = () => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCategory, setEditingCategory] = useState<Category | null>(null);
  
  // Form State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState('');

  const loadCategories = async () => {
    setLoading(true);
    try {
      const res = await getCategoriesApi();
      setCategories(res.data.categories || []);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadCategories();
  }, []);

  const openModal = (category: Category | null = null) => {
    if (category) {
      setEditingCategory(category);
      setName(category.name);
      setDescription(category.description || '');
      setImagePreview(category.image || '');
    } else {
      setEditingCategory(null);
      setName('');
      setDescription('');
      setImagePreview('');
    }
    setImageFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setEditingCategory(null);
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setImageFile(file);
      setImagePreview(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('name', name);
    formData.append('description', description);
    if (imageFile) formData.append('images', imageFile);

    try {
      if (editingCategory) {
        // For editing, we might send as JSON if no new image, or FormData if image changed
        // Simplified: use FormData if image changed, else JSON
        if (imageFile) {
          await editCategoryApi(editingCategory._id, formData);
        } else {
          await editCategoryApi(editingCategory._id, { name, description });
        }
        toast.success('Category updated successfully');
      } else {
        await addCategoryApi(formData);
        toast.success('Category created successfully');
      }
      closeModal();
      loadCategories();
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Something went wrong');
    }
  };

  const handleDelete = async (id: string) => {
    if (!window.confirm('Are you sure you want to delete this category?')) return;
    try {
      await deleteCategoryApi(id);
      toast.success('Category deleted');
      loadCategories();
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  return (
    <div className="admin-management-page">
      <div className="admin-header">
        <div>
          <h2>Category Management</h2>
          <p className="text-soft text-sm">Organize your products into categories</p>
        </div>
        <button className="btn btn-primary" onClick={() => openModal()}>
          <Plus size={18} /> Add Category
        </button>
      </div>

      {loading ? (
        <div className="page-loader"><div className="spinner" /></div>
      ) : (
        <div className="admin-table-container">
          <table className="admin-table">
            <thead>
              <tr>
                <th>Image</th>
                <th>Name</th>
                <th>Slug</th>
                <th>Description</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {categories.map((cat) => (
                <tr key={cat._id}>
                  <td>
                    <div style={{ width: 50, height: 50, borderRadius: 8, overflow: 'hidden', background: '#f5f5f6' }}>
                      <img 
                        src={cat.image || 'https://placehold.co/50x50?text=No+Img'} 
                        alt={cat.name} 
                        style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                      />
                    </div>
                  </td>
                  <td className="font-bold">{cat.name}</td>
                  <td className="text-soft text-xs">{cat.slug}</td>
                  <td className="text-soft text-sm">{cat.description || '—'}</td>
                  <td>
                    <div className="actions">
                      <button onClick={() => openModal(cat)}><Edit2 size={16} /></button>
                      <button className="delete" onClick={() => handleDelete(cat._id)}><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {isModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal">
            <div className="flex justify-between items-center mb-6">
              <h3>{editingCategory ? 'Edit Category' : 'Add New Category'}</h3>
              <button onClick={closeModal} className="text-soft hover:text-dark"><X size={20} /></button>
            </div>
            
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Category Name</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  placeholder="e.g. Women's Ethnic"
                  required 
                />
              </div>
              
              <div className="form-group">
                <label>Description</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  placeholder="Tell something about this category..."
                  rows={3}
                />
              </div>

              <div className="form-group">
                <label>Category Image</label>
                <div className="flex gap-4 items-center">
                  <div style={{ width: 80, height: 80, borderRadius: 12, border: '2px dashed #d4d5d9', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: '#f9f9f9' }}>
                    {imagePreview ? (
                      <img src={imagePreview} alt="Preview" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : (
                      <ImageIcon size={24} className="text-soft" />
                    )}
                  </div>
                  <input 
                    type="file" 
                    accept="image/*" 
                    onChange={handleImageChange}
                    className="text-xs"
                  />
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={closeModal}>Cancel</button>
                <button type="submit" className="btn-primary">
                  {editingCategory ? 'Update Category' : 'Create Category'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminCategories;
