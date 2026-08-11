import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { ArrowLeft, Phone, Mail, Building, MapPin, Clock } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import './customers.css';

const CustomerDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [customer, setCustomer] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [note, setNote] = useState('');
  const [submittingNote, setSubmittingNote] = useState(false);

  const fetchCustomer = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/customers/${id}`);
      setCustomer(res.data.data);
    } catch (error) {
      toast.error('Failed to load customer details');
      navigate('/customers');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCustomer();
  }, [id]);

  const handleAddFollowUp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!note.trim()) return;
    
    setSubmittingNote(true);
    try {
      await api.post(`/customers/${id}/follow-ups`, { note });
      toast.success('Follow-up note added');
      setNote('');
      fetchCustomer();
    } catch (error) {
      toast.error('Failed to add note');
    } finally {
      setSubmittingNote(false);
    }
  };

  if (loading) return <div className="page-content text-center">Loading customer details...</div>;
  if (!customer) return null;

  return (
    <div className="customer-detail">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn-icon" onClick={() => navigate('/customers')}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1>{customer.name}</h1>
            <p>Customer Details & History</p>
          </div>
        </div>
        <span className={`badge badge-${customer.status === 'active' ? 'success' : customer.status === 'lead' ? 'warning' : 'danger'}`}>
          {customer.status}
        </span>
      </div>

      <div className="grid-3">
        {/* Info Card */}
        <div className="card" style={{ gridColumn: 'span 1' }}>
          <h2>Contact Info</h2>
          <div className="info-list mt-4">
            <div className="info-item">
              <Phone size={18} className="text-tertiary" />
              <span>{customer.mobile}</span>
            </div>
            {customer.email && (
              <div className="info-item">
                <Mail size={18} className="text-tertiary" />
                <span>{customer.email}</span>
              </div>
            )}
            {customer.businessName && (
              <div className="info-item">
                <Building size={18} className="text-tertiary" />
                <span>{customer.businessName}</span>
              </div>
            )}
            {customer.address && (
              <div className="info-item">
                <MapPin size={18} className="text-tertiary" />
                <span>{customer.address}</span>
              </div>
            )}
            <div className="info-item mt-4">
              <strong>Type:</strong> <span className="badge badge-neutral ml-2">{customer.customerType}</span>
            </div>
            {customer.gstNumber && (
              <div className="info-item">
                <strong>GST:</strong> <span className="ml-2">{customer.gstNumber}</span>
              </div>
            )}
          </div>
        </div>

        {/* Follow Ups */}
        <div className="card" style={{ gridColumn: 'span 2' }}>
          <h2>Follow-up Timeline</h2>
          
          <form onSubmit={handleAddFollowUp} className="follow-up-form mt-4">
            <div className="form-group mb-0" style={{ flex: 1 }}>
              <input 
                type="text" 
                className="form-input" 
                placeholder="Add a new follow up note..." 
                value={note}
                onChange={(e) => setNote(e.target.value)}
              />
            </div>
            <button type="submit" className="btn btn-primary" disabled={submittingNote || !note.trim()}>
              Add Note
            </button>
          </form>

          <div className="timeline mt-4">
            {customer.followUps?.length === 0 ? (
              <p className="text-center text-tertiary">No follow-ups recorded yet.</p>
            ) : (
              customer.followUps?.map((f: any) => (
                <div key={f.id} className="timeline-item">
                  <div className="timeline-icon"><Clock size={16} /></div>
                  <div className="timeline-content">
                    <p className="timeline-text">{f.note}</p>
                    <div className="timeline-meta">
                      <span>{f.user?.name}</span> • <span>{new Date(f.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CustomerDetailPage;
