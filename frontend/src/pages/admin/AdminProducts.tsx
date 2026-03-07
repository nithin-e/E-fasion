import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Plus, Edit2, Trash2 } from 'lucide-react';
import { getProductsApi, deleteProductApi } from '../../api/productApi';
import type { Product } from '../../types';
import { toast } from '../../hooks/useToast';

const AdminProducts: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getProductsApi({ limit: 100 }).then((r) => setProducts(r.data.products || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const handleDelete = async (id: string) => {
    if (!window.confirm('Soft-delete this product?')) return;
    await deleteProductApi(id);
    toast.success('Product deleted');
    load();
  };

  return (
    <div>
      <div className="admin-page-header">
        <div><h1>Products</h1><p>Manage your product catalog</p></div>
        <Link to="/admin/products/add" className="btn btn-primary"><Plus size={16} /> Add Product</Link>
      </div>
      {loading ? <div className="page-loader"><div className="spinner" /></div> : (
        <div className="table-wrapper card">
          <table className="table">
            <thead>
              <tr><th>Product</th><th>Brand</th><th>Base Price</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id}>
                  <td>
                    <div className="flex items-center gap-3">
                      <div className="admin-product-img">
                        <img src={p.variants?.[0]?.images?.[0] || 'https://placehold.co/40x50'} alt="" />
                      </div>
                      <div>
                        <p className="font-bold text-sm mb-1">{p.name}</p>
                        <p className="text-[10px] text-soft uppercase tracking-wider">{(p.categoryId as any)?.name || '—'}</p>
                      </div>
                    </div>
                  </td>
                  <td className="text-sm text-soft">{(p.brand as any)?.name || p.brand}</td>
                  <td className="font-bold text-dark">₹{p.basePrice.toLocaleString('en-IN')}</td>
                  <td>
                    <span className={`badge ${p.is_deleted ? 'badge-error' : 'badge-success'}`}>
                      {p.is_deleted ? 'Trash' : 'Live'}
                    </span>
                  </td>
                  <td>
                    <div className="actions">
                      <Link to={`/admin/products/${p._id}/edit`} title="Edit Product"><Edit2 size={16} /></Link>
                      <button className="delete" onClick={() => handleDelete(p._id)} title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminProducts;
