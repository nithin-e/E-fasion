import React, { useEffect, useState } from 'react';
import { Plus, Trash2 } from 'lucide-react';
import { getCouponsApi, addCouponApi, deleteCouponApi } from '../../api/userApi';
import type { Coupon } from '../../types';
import { toast } from '../../hooks/useToast';

const AdminCoupons: React.FC = () => {
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [loading, setLoading] = useState(true);
  const [showAdd, setShowAdd] = useState(false);
  const [form, setForm] = useState({ code: '', discount: 10, minPurchase: 500, maxRedeemable: 100, expiresAt: '' });

  const load = () => { setLoading(true); getCouponsApi().then((r) => setCoupons(r.data.coupons || [])).finally(() => setLoading(false)); };
  useEffect(load, []);

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault();
    await addCouponApi({ ...form, discount: Number(form.discount), minPurchase: Number(form.minPurchase), maxRedeemable: Number(form.maxRedeemable) });
    toast.success('Coupon created!');
    setShowAdd(false);
    load();
  };

  const handleDelete = async (id: string) => {
    await deleteCouponApi(id);
    toast.success('Coupon deleted');
    load();
  };

  return (
    <div>
      <div className="admin-page-header">
        <div><h1>Coupons</h1><p>Create and manage discount codes</p></div>
        <button className="btn btn-primary" onClick={() => setShowAdd(!showAdd)}><Plus size={16} /> Add Coupon</button>
      </div>

      {showAdd && (
        <div className="card card-body mb-6" style={{maxWidth:600}}>
          <h3 style={{fontSize:'var(--text-base)',fontFamily:'var(--font-sans)',fontWeight:700,marginBottom:'var(--space-5)'}}>New Coupon</h3>
          <form onSubmit={handleAdd} style={{display:'flex',flexDirection:'column',gap:'var(--space-4)'}}>
            {[
              { key: 'code', label: 'Coupon Code', type: 'text', placeholder: 'BEAUTY20' },
              { key: 'discount', label: 'Discount %', type: 'number' },
              { key: 'minPurchase', label: 'Min Purchase (₹)', type: 'number' },
              { key: 'maxRedeemable', label: 'Max Uses', type: 'number' },
              { key: 'expiresAt', label: 'Expires At', type: 'date' },
            ].map(({ key, label, type, placeholder }) => (
              <div className="form-group" key={key}>
                <label className="form-label">{label}</label>
                <input type={type} className="form-input" placeholder={placeholder}
                  value={(form as any)[key]}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })} required />
              </div>
            ))}
            <div className="flex gap-3">
              <button type="submit" className="btn btn-primary">Create</button>
              <button type="button" className="btn btn-ghost" onClick={() => setShowAdd(false)}>Cancel</button>
            </div>
          </form>
        </div>
      )}

      {loading ? <div className="page-loader"><div className="spinner" /></div> : (
        <div className="table-wrapper card">
          <table className="table">
            <thead><tr><th>Code</th><th>Discount</th><th>Min Purchase</th><th>Max Uses</th><th>Expires</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {coupons.map((c) => (
                <tr key={c._id}>
                  <td><code style={{background:'var(--color-surface-alt)',padding:'2px 8px',borderRadius:6,fontSize:'var(--text-sm)'}}>{c.code}</code></td>
                  <td className="font-semibold">{c.discount}%</td>
                  <td>₹{c.minPurchase.toLocaleString('en-IN')}</td>
                  <td>{c.maxRedeemable}</td>
                  <td className="text-sm text-soft">{new Date(c.expiresAt).toLocaleDateString('en-IN')}</td>
                  <td><span className={`badge ${c.is_active ? 'badge-success' : 'badge-error'}`}>{c.is_active ? 'Active' : 'Inactive'}</span></td>
                  <td><button className="btn btn-danger btn-sm" onClick={() => handleDelete(c._id)}><Trash2 size={14} /></button></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default AdminCoupons;
