import React, { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { X, Plus, Trash2, Save, ArrowLeft, Edit2 } from 'lucide-react';
import { 
  getProductByIdApi, 
  addProductApi, 
  editProductApi, 
  getCategoriesApi, 
  getBrandsApi,
  addVariantApi,
  editVariantApi,
  deleteVariantApi
} from '../../api/productApi';
import { toast } from '../../hooks/useToast';
import type { Category, Brand, Product, Variant } from '../../types';
import './AdminCommon.css';

const AdminProductForm: React.FC = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEdit = !!id;

  const [loading, setLoading] = useState(isEdit);
  const [categories, setCategories] = useState<Category[]>([]);
  const [brands, setBrands] = useState<Brand[]>([]);
  
  // Product State
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [brandId, setBrandId] = useState('');
  const [basePrice, setBasePrice] = useState('');
  const [highlights, setHighlights] = useState<string[]>(['']);

  // Variant Modal State
  const [isVariantModalOpen, setIsVariantModalOpen] = useState(false);
  const [editingVariant, setEditingVariant] = useState<Variant | null>(null);
  const [vSize, setVSize] = useState('');
  const [vPrice, setVPrice] = useState('');
  const [vStock, setVStock] = useState('');
  const [vShadeName, setVShadeName] = useState('');
  const [vShadeHex, setVShadeHex] = useState('');
  const [vImages, setVImages] = useState<File[]>([]);
  const [vImagePreviews, setVImagePreviews] = useState<string[]>([]);

  const [existingVariants, setExistingVariants] = useState<Variant[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [catRes, brandRes] = await Promise.all([getCategoriesApi(), getBrandsApi()]);
        setCategories(catRes.data.categories || []);
        setBrands(brandRes.data.brands || []);

        if (isEdit) {
          const prodRes = await getProductByIdApi(id!);
          const p = prodRes.data.product as Product;
          setName(p.name);
          setDescription(p.description);
          setCategoryId((p.categoryId as any)?._id || (p.categoryId as any));
          setBrandId((p.brand as any)?._id || (p.brand as any));
          setBasePrice(p.basePrice.toString());
          setHighlights(p.highlights.length ? p.highlights : ['']);
          setExistingVariants(p.variants || []);
        }
      } catch (error) {
        toast.error('Failed to load data');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, [id, isEdit]);

  const handleAddHighlight = () => setHighlights([...highlights, '']);
  const handleRemoveHighlight = (idx: number) => setHighlights(highlights.filter((_, i) => i !== idx));
  const handleHighlightChange = (idx: number, val: string) => {
    const newH = [...highlights];
    newH[idx] = val;
    setHighlights(newH);
  };

  const handleSubmitProduct = async (e: React.FormEvent) => {
    e.preventDefault();
    const data = {
      name,
      description,
      category: categoryId,
      brand: brandId,
      basePrice: Number(basePrice),
      highlights: highlights.filter(h => h.trim() !== '')
    };

    try {
      if (isEdit) {
        await editProductApi(id!, data);
        toast.success('Product updated');
      } else {
        const res = await addProductApi(data as any); // addProductApi expects FormData but backend handles both? Let's check. 
        // Actually our backend createProduct handles JSON.
        toast.success('Product created. Now add variants.');
        navigate(`/admin/products/${res.data.product._id}/edit`);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  // Variant Handlers
  const openVariantModal = (v: Variant | null = null) => {
    if (v) {
      setEditingVariant(v);
      setVSize(v.size);
      setVPrice(v.price.toString());
      setVStock(v.stock.toString());
      setVShadeName(v.shadeName || '');
      setVShadeHex(v.shadeHex || '');
      setVImagePreviews(v.images || []);
    } else {
      setEditingVariant(null);
      setVSize('');
      setVPrice('');
      setVStock('');
      setVShadeName('');
      setVShadeHex('');
      setVImagePreviews([]);
    }
    setVImages([]);
    setIsVariantModalOpen(true);
  };

  const handleVariantImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    setVImages([...vImages, ...files]);
    const previews = files.map(f => URL.createObjectURL(f));
    setVImagePreviews([...vImagePreviews, ...previews]);
  };

  const handleSaveVariant = async (e: React.FormEvent) => {
    e.preventDefault();
    const formData = new FormData();
    formData.append('size', vSize);
    formData.append('price', vPrice);
    formData.append('stock', vStock);
    formData.append('shadeName', vShadeName);
    formData.append('shadeHex', vShadeHex);
    vImages.forEach(img => formData.append('images', img));

    try {
      if (editingVariant) {
        await editVariantApi(editingVariant._id, formData);
        toast.success('Variant updated');
      } else {
        await addVariantApi(id!, formData);
        toast.success('Variant added');
      }
      setIsVariantModalOpen(false);
      // Refresh variants
      const prodRes = await getProductByIdApi(id!);
      setExistingVariants(prodRes.data.product.variants || []);
    } catch (error: any) {
      toast.error('Failed to save variant');
    }
  };

  const handleDeleteVariant = async (vId: string) => {
    if (!window.confirm('Delete this variant?')) return;
    try {
      await deleteVariantApi(vId);
      toast.success('Variant deleted');
      setExistingVariants(existingVariants.filter(v => v._id !== vId));
    } catch (error) {
      toast.error('Delete failed');
    }
  };

  if (loading) return <div className="page-loader"><div className="spinner" /></div>;

  return (
    <div className="admin-management-page">
      <div className="admin-header">
        <div className="flex items-center gap-4">
          <button onClick={() => navigate('/admin/products')} className="text-soft hover:text-dark"><ArrowLeft /></button>
          <div>
            <h2>{isEdit ? 'Edit Product' : 'Add New Product'}</h2>
            <p className="text-soft text-sm">Fill in the details to {isEdit ? 'update' : 'list'} a product</p>
          </div>
        </div>
        <button form="product-form" type="submit" className="btn btn-primary">
          <Save size={18} /> {isEdit ? 'Update Product' : 'Save & Continue'}
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Main Form */}
        <div className="lg:col-span-2 space-y-8">
          <form id="product-form" onSubmit={handleSubmitProduct} className="card p-8 space-y-6">
            <div className="form-group">
              <label>Product Name</label>
              <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="e.g. Slim Fit Cotton Shirt" required />
            </div>

            <div className="grid grid-cols-2 gap-6">
              <div className="form-group">
                <label>Category</label>
                <select value={categoryId} onChange={e => setCategoryId(e.target.value)} className="form-input" required>
                  <option value="">Select Category</option>
                  {categories.map(c => <option key={c._id} value={c._id}>{c.name}</option>)}
                </select>
              </div>
              <div className="form-group">
                <label>Brand</label>
                <select value={brandId} onChange={e => setBrandId(e.target.value)} className="form-input" required>
                  <option value="">Select Brand</option>
                  {brands.map(b => <option key={b._id} value={b._id}>{b.name}</option>)}
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea value={description} onChange={e => setDescription(e.target.value)} rows={5} placeholder="Write something compelling..." required />
            </div>

            <div className="form-group">
              <label>Base Price (₹)</label>
              <input type="number" value={basePrice} onChange={e => setBasePrice(e.target.value)} placeholder="0.00" required />
            </div>

            <div className="form-group">
              <label>Highlights</label>
              <div className="space-y-3">
                {highlights.map((h, i) => (
                  <div key={i} className="flex gap-2">
                    <input type="text" value={h} onChange={e => handleHighlightChange(i, e.target.value)} placeholder="e.g. 100% Cotton" />
                    {highlights.length > 1 && (
                      <button type="button" onClick={() => handleRemoveHighlight(i)} className="text-error p-2"><Trash2 size={18} /></button>
                    )}
                  </div>
                ))}
                <button type="button" onClick={handleAddHighlight} className="btn btn-sm btn-outline"><Plus size={14} /> Add Highlight</button>
              </div>
            </div>
          </form>

          {/* Variants Section */}
          {isEdit && (
            <div className="card p-8">
              <div className="flex justify-between items-center mb-6">
                <h3 className="text-lg font-bold">Product Variants</h3>
                <button className="btn btn-sm btn-primary" onClick={() => openVariantModal()}>
                  <Plus size={16} /> Add Variant
                </button>
              </div>

              <div className="admin-table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Images</th>
                      <th>Size</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Color</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {existingVariants.map(v => (
                      <tr key={v._id}>
                        <td>
                          <div className="flex -space-x-2">
                            {v.images.slice(0, 3).map((img, i) => (
                              <img key={i} src={img} className="w-8 h-8 rounded-full border-2 border-white object-cover" />
                            ))}
                            {v.images.length > 3 && <div className="w-8 h-8 rounded-full bg-soft text-[10px] flex items-center justify-center border-2 border-white">+{v.images.length - 3}</div>}
                          </div>
                        </td>
                        <td>{v.size}</td>
                        <td className="font-bold">₹{v.price}</td>
                        <td>{v.stock}</td>
                        <td>
                          {v.shadeHex ? (
                            <div className="flex items-center gap-2">
                              <div style={{ width: 16, height: 16, borderRadius: '50%', background: v.shadeHex, border: '1px solid #ddd' }} />
                              <span className="text-xs">{v.shadeName}</span>
                            </div>
                          ) : '—'}
                        </td>
                        <td>
                          <div className="actions">
                            <button onClick={() => openVariantModal(v)}><Edit2 size={14} /></button>
                            <button className="delete" onClick={() => handleDeleteVariant(v._id)}><Trash2 size={14} /></button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <div className="card p-6 bg-primary/5 border-primary/10">
            <h4 className="font-bold mb-4 text-primary">Guidelines</h4>
            <ul className="text-xs space-y-3 text-soft-dark">
              <li>• Use high-quality images for variants (min 1000x1200px)</li>
              <li>• Describe the material, fit, and style in description</li>
              <li>• Base price is the default, but variant prices can differ</li>
              <li>• Highlights appear as bullet points on product page</li>
            </ul>
          </div>
        </div>
      </div>

      {/* Variant Modal */}
      {isVariantModalOpen && (
        <div className="admin-modal-overlay">
          <div className="admin-modal" style={{ maxWidth: 600 }}>
            <div className="flex justify-between items-center mb-6">
              <h3>{editingVariant ? 'Edit Variant' : 'Add Variant'}</h3>
              <button onClick={() => setIsVariantModalOpen(false)}><X size={20} /></button>
            </div>
            <form onSubmit={handleSaveVariant} className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label>Size</label>
                  <input type="text" value={vSize} onChange={e => setVSize(e.target.value)} placeholder="e.g. XL, 42" required />
                </div>
                <div className="form-group">
                  <label>Price (₹)</label>
                  <input type="number" value={vPrice} onChange={e => setVPrice(e.target.value)} required />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="form-group">
                  <label>Stock</label>
                  <input type="number" value={vStock} onChange={e => setVStock(e.target.value)} required />
                </div>
                <div className="form-group">
                  <label>Color Name</label>
                  <input type="text" value={vShadeName} onChange={e => setVShadeName(e.target.value)} placeholder="e.g. Navy Blue" />
                </div>
              </div>
              <div className="form-group">
                <label>Color Hex Code</label>
                <div className="flex gap-2">
                  <input type="color" value={vShadeHex || '#000000'} onChange={e => setVShadeHex(e.target.value)} style={{width:44,padding:2}} />
                  <input type="text" value={vShadeHex} onChange={e => setVShadeHex(e.target.value)} placeholder="#000000" />
                </div>
              </div>

              <div className="form-group">
                <label>Variant Images</label>
                <div className="grid grid-cols-4 gap-2 mb-2">
                  {vImagePreviews.map((p, i) => (
                    <div key={i} className="aspect-[3/4] rounded-lg overflow-hidden relative group">
                      <img src={p} className="w-full h-full object-cover" />
                    </div>
                  ))}
                  <label className="aspect-[3/4] rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:bg-soft/50 transition-colors">
                    <Plus size={24} className="text-soft" />
                    <span className="text-[10px] text-soft">Upload</span>
                    <input type="file" multiple accept="image/*" onChange={handleVariantImageChange} hidden />
                  </label>
                </div>
              </div>

              <div className="modal-actions">
                <button type="button" onClick={() => setIsVariantModalOpen(false)}>Cancel</button>
                <button type="submit" className="btn btn-primary">{editingVariant ? 'Update Variant' : 'Add Variant'}</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminProductForm;
