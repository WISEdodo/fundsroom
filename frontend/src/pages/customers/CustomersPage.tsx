import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Plus, Search, Eye, Edit } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import CustomerFormModal from './CustomerFormModal';
import './customers.css';

interface Customer {
  id: string;
  name: string;
  mobile: string;
  email: string;
  businessName: string;
  customerType: string;
  status: string;
}

const CustomersPage: React.FC = () => {
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null);
  const navigate = useNavigate();

  const fetchCustomers = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/customers?search=${search}`);
      setCustomers(res.data.data);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchCustomers();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleAdd = () => {
    setSelectedCustomer(null);
    setIsModalOpen(true);
  };

  const handleEdit = (customer: Customer) => {
    setSelectedCustomer(customer);
    setIsModalOpen(true);
  };

  const handleModalClose = (refresh?: boolean) => {
    setIsModalOpen(false);
    if (refresh) fetchCustomers();
  };

  return (
    <div className="customers-page">
      <div className="page-header">
        <div>
          <h1>Customers</h1>
          <p>Manage your CRM contacts and leads</p>
        </div>
        <button className="btn btn-primary" onClick={handleAdd}>
          <Plus size={18} /> Add Customer
        </button>
      </div>

      <div className="card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, email, or company..."
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
                <th>Name</th>
                <th>Contact</th>
                <th>Company</th>
                <th>Type</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center">Loading...</td></tr>
              ) : customers.length === 0 ? (
                <tr><td colSpan={6} className="text-center">No customers found.</td></tr>
              ) : (
                customers.map((c) => (
                  <tr key={c.id}>
                    <td className="font-medium">{c.name}</td>
                    <td>
                      <div>{c.mobile}</div>
                      <div className="text-small text-tertiary">{c.email}</div>
                    </td>
                    <td>{c.businessName || '-'}</td>
                    <td>
                      <span className="badge badge-neutral">{c.customerType}</span>
                    </td>
                    <td>
                      <span className={`badge badge-${c.status === 'active' ? 'success' : c.status === 'lead' ? 'warning' : 'danger'}`}>
                        {c.status}
                      </span>
                    </td>
                    <td>
                      <div className="action-buttons">
                        <button className="btn-icon" onClick={() => navigate(`/customers/${c.id}`)}>
                          <Eye size={18} />
                        </button>
                        <button className="btn-icon" onClick={() => handleEdit(c)}>
                          <Edit size={18} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isModalOpen && (
        <CustomerFormModal
          customer={selectedCustomer}
          onClose={handleModalClose}
        />
      )}
    </div>
  );
};

export default CustomersPage;
