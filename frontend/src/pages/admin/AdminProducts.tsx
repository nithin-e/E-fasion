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
                    <div className="flex items-center gap-2">
                      <div style={{width:40,height:40,borderRadius:8,background:'var(--color-surface-alt)',overflow:'hidden'}}>
                        <img src={p.variants?.[0]?.images?.[0] || 'https://placehold.co/40'} alt="" style={{width:'100%',height:'100%',objectFit:'cover'}} />
                      </div>
                      <span className="font-medium text-sm">{p.name}</span>
                    </div>
                  </td>
                  <td className="text-sm text-soft">{p.brand}</td>
                  <td className="font-semibold">₹{p.basePrice.toLocaleString('en-IN')}</td>
                  <td><span className={`badge ${p.is_deleted ? 'badge-error' : 'badge-success'}`}>{p.is_deleted ? 'Deleted' : 'Active'}</span></td>
                  <td>
                    <div className="flex gap-2">
                      <Link to={`/admin/products/${p._id}/edit`} className="btn btn-outline btn-sm"><Edit2 size={14} /></Link>
                      <button className="btn btn-danger btn-sm" onClick={() => handleDelete(p._id)}><Trash2 size={14} /></button>
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
