import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { api } from '../../utils/api';

interface CustomerFormModalProps {
  customer: any | null;
  onClose: (refresh?: boolean) => void;
}

const CustomerFormModal: React.FC<CustomerFormModalProps> = ({ customer, onClose }) => {
  const [formData, setFormData] = useState({
    name: customer?.name || '',
    mobile: customer?.mobile || '',
    email: customer?.email || '',
    businessName: customer?.businessName || '',
    gstNumber: customer?.gstNumber || '',
    customerType: customer?.customerType || 'retail',
    address: customer?.address || '',
    status: customer?.status || 'lead',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (customer) {
        await api.put(`/customers/${customer.id}`, formData);
        toast.success('Customer updated successfully');
      } else {
        await api.post('/customers', formData);
        toast.success('Customer added successfully');
      }
      onClose(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to save customer');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose()}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{customer ? 'Edit Customer' : 'Add New Customer'}</h2>
          <button className="btn-icon" onClick={() => onClose()}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Full Name *</label>
                <input required type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Mobile Number *</label>
                <input required type="text" name="mobile" className="form-input" value={formData.mobile} onChange={handleChange} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Email Address</label>
                <input type="email" name="email" className="form-input" value={formData.email} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Business/Company Name</label>
                <input type="text" name="businessName" className="form-input" value={formData.businessName} onChange={handleChange} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Customer Type *</label>
                <select name="customerType" className="form-select" value={formData.customerType} onChange={handleChange}>
                  <option value="retail">Retail</option>
                  <option value="wholesale">Wholesale</option>
                  <option value="distributor">Distributor</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Status *</label>
                <select name="status" className="form-select" value={formData.status} onChange={handleChange}>
                  <option value="lead">Lead</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">GST Number</label>
              <input type="text" name="gstNumber" className="form-input" value={formData.gstNumber} onChange={handleChange} />
            </div>

            <div className="form-group">
              <label className="form-label">Address</label>
              <textarea name="address" className="form-textarea" rows={3} value={formData.address} onChange={handleChange}></textarea>
            </div>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => onClose()}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Customer'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CustomerFormModal;
