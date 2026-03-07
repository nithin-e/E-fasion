import React, { useEffect, useState } from 'react';
import { getCustomersApi, blockUserApi } from '../../api/userApi';
import type { User } from '../../types';
import { toast } from '../../hooks/useToast';

const AdminCustomers: React.FC = () => {
  const [customers, setCustomers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    getCustomersApi().then((r) => setCustomers(r.data.customers || [])).finally(() => setLoading(false));
  };
  useEffect(load, []);

  const toggleBlock = async (id: string, blocked: boolean) => {
    await blockUserApi(id, !blocked);
    toast.success(blocked ? 'User unblocked' : 'User blocked');
    load();
  };

  return (
    <div>
      <div className="admin-page-header"><div><h1>Customers</h1><p>Manage your customer base</p></div></div>
      {loading ? <div className="page-loader"><div className="spinner" /></div> : (
        <div className="table-wrapper card">
          <table className="table">
            <thead><tr><th>Customer</th><th>Mobile</th><th>Verified</th><th>Status</th><th>Actions</th></tr></thead>
            <tbody>
              {customers.map((c) => (
                <tr key={c._id}>
                  <td>
                    <div className="flex items-center gap-2">
                      <div style={{width:36,height:36,borderRadius:'50%',background:'var(--color-primary)',color:'#fff',display:'flex',alignItems:'center',justifyContent:'center',fontSize:'var(--text-sm)',fontWeight:700}}>{c.name[0]}</div>
                      <div><p className="font-medium text-sm">{c.name}</p><p className="text-xs text-soft">{c.email}</p></div>
                    </div>
                  </td>
                  <td className="text-sm">{c.mobile}</td>
                  <td><span className={`badge ${c.is_verified ? 'badge-success' : 'badge-warning'}`}>{c.is_verified ? 'Verified' : 'Pending'}</span></td>
                  <td><span className={`badge ${c.is_blocked ? 'badge-error' : 'badge-success'}`}>{c.is_blocked ? 'Blocked' : 'Active'}</span></td>
                  <td>
                    <button className={`btn btn-sm ${c.is_blocked ? 'btn-outline' : 'btn-danger'}`} onClick={() => toggleBlock(c._id, c.is_blocked)}>
                      {c.is_blocked ? 'Unblock' : 'Block'}
                    </button>
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

export default AdminCustomers;
