import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, CheckCircle, XCircle } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import './challans.css';

interface Challan {
  id: string;
  challanNumber: string;
  totalQuantity: number;
  status: string;
  createdAt: string;
  customerSnapshot: any;
  items: any[];
}

const ChallansPage: React.FC = () => {
  const [challans, setChallans] = useState<Challan[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const navigate = useNavigate();

  const fetchChallans = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/challans?search=${search}`);
      setChallans(res.data.data.items || res.data.data);
    } catch (error) {
      toast.error('Failed to load challans');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchChallans();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleStatusChange = async (id: string, action: 'confirm' | 'cancel') => {
    if (!window.confirm(`Are you sure you want to ${action} this challan?`)) return;
    try {
      await api.post(`/challans/${id}/${action}`);
      toast.success(`Challan ${action}ed successfully`);
      fetchChallans();
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || `Failed to ${action} challan`);
    }
  };

  return (
    <div className="challans-page">
      <div className="page-header">
        <div>
          <h1>Sales Challans</h1>
          <p>Manage dispatch and sales orders</p>
        </div>
        <button className="btn btn-primary" onClick={() => navigate('/challans/create')}>
          <Plus size={18} /> Create Challan
        </button>
      </div>

      <div className="card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by challan number..."
              className="form-input pl-10"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
        </div>

        <div className="table-container">
          <table className="table">
            <thead>
              <tr>
                <th>Challan No.</th>
                <th>Customer</th>
                <th>Date</th>
                <th>Items (Qty)</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center">Loading...</td></tr>
              ) : challans.length === 0 ? (
                <tr><td colSpan={6} className="text-center">No challans found.</td></tr>
              ) : (
                challans.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium text-primary">{c.challanNumber}</td>
                    <td>
                      <div>{c.customerSnapshot?.name}</div>
                      <div className="text-small text-tertiary">{c.customerSnapshot?.businessName}</div>
                    </td>
                    <td>{new Date(c.createdAt).toLocaleDateString()}</td>
                    <td>
                      {c.items?.length || 0} items ({c.totalQuantity} total)
                    </td>
                    <td>
                      <span className={`badge badge-${c.status === 'confirmed' ? 'success' : c.status === 'draft' ? 'warning' : 'danger'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" title="View Details">
                          <Eye size={18} />
                        </button>
                        {c.status === 'draft' && (
                          <button className="btn-icon text-success" title="Confirm Challan" onClick={() => handleStatusChange(c.id, 'confirm')}>
                            <CheckCircle size={18} />
                          </button>
                        )}
                        {c.status === 'confirmed' && (
                          <button className="btn-icon text-danger" title="Cancel Challan" onClick={() => handleStatusChange(c.id, 'cancel')}>
                            <XCircle size={18} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ChallansPage;
