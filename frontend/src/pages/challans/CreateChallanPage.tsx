import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, Plus, Trash2 } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import './challans.css';

const CreateChallanPage: React.FC = () => {
  const navigate = useNavigate();
  const [customers, setCustomers] = useState<any[]>([]);
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);

  const [selectedCustomerId, setSelectedCustomerId] = useState('');
  const [items, setItems] = useState([{ productId: '', quantity: 1, unitPrice: 0 }]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [custRes, prodRes] = await Promise.all([
          api.get('/customers?limit=100'),
          api.get('/products?limit=100')
        ]);
        setCustomers(custRes.data.data.items || custRes.data.data);
        setProducts(prodRes.data.data.items || prodRes.data.data);
      } catch (error) {
        toast.error('Failed to load customers or products');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const handleItemChange = (index: number, field: string, value: any) => {
    const newItems = [...items];
    if (field === 'productId') {
      const product = products.find(p => p.id === value);
      newItems[index] = { ...newItems[index], productId: value, unitPrice: product?.unitPrice || 0 };
    } else {
      newItems[index] = { ...newItems[index], [field]: value };
    }
    setItems(newItems);
  };

  const addItem = () => setItems([...items, { productId: '', quantity: 1, unitPrice: 0 }]);
  const removeItem = (index: number) => setItems(items.filter((_, i) => i !== index));

  const totalQty = items.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomerId) return toast.error('Please select a customer');
    if (items.some(i => !i.productId || i.quantity <= 0)) {
      return toast.error('Please complete all item fields with valid quantities');
    }

    setSubmitting(true);
    try {
      await api.post('/challans', {
        customerId: selectedCustomerId,
        items: items.map(i => ({ productId: i.productId, quantity: Number(i.quantity), unitPrice: Number(i.unitPrice) }))
      });
      toast.success('Challan created successfully as Draft');
      navigate('/challans');
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to create challan');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) return <div className="page-content text-center">Loading form data...</div>;

  return (
    <div className="create-challan-page">
      <div className="page-header">
        <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
          <button className="btn-icon" onClick={() => navigate('/challans')}>
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1>Create Sales Challan</h1>
            <p>Generate a new draft challan</p>
          </div>
        </div>
      </div>

      <div className="card">
        <form onSubmit={handleSubmit}>
          
          <div className="challan-form-section">
            <h2>1. Select Customer</h2>
            <div className="form-group mt-4" style={{ maxWidth: '400px' }}>
              <select className="form-select" value={selectedCustomerId} onChange={(e) => setSelectedCustomerId(e.target.value)} required>
                <option value="">-- Choose a Customer --</option>
                {customers.map(c => (
                  <option key={c.id} value={c.id}>{c.name} ({c.businessName || 'Individual'})</option>
                ))}
              </select>
            </div>
          </div>

          <div className="challan-form-section">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
              <h2>2. Add Products</h2>
              <button type="button" className="btn btn-secondary" onClick={addItem}>
                <Plus size={16} /> Add Row
              </button>
            </div>
            
            <div className="items-list">
              {items.map((item, index) => (
                <div key={index} className="item-row">
                  <div className="form-group mb-0">
                    <label className="form-label">Product</label>
                    <select className="form-select" value={item.productId} onChange={(e) => handleItemChange(index, 'productId', e.target.value)} required>
                      <option value="">Select a product...</option>
                      {products.map(p => (
                        <option key={p.id} value={p.id}>{p.name} (SKU: {p.sku}) - {p.currentStock} in stock</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">Price ($)</label>
                    <input type="number" className="form-input bg-gray-100" value={item.unitPrice} disabled />
                  </div>
                  <div className="form-group mb-0">
                    <label className="form-label">Qty</label>
                    <input type="number" min="1" className="form-input" value={item.quantity} onChange={(e) => handleItemChange(index, 'quantity', e.target.value)} required />
                  </div>
                  <button type="button" className="btn-icon text-danger" onClick={() => removeItem(index)} disabled={items.length === 1}>
                    <Trash2 size={20} />
                  </button>
                </div>
              ))}
            </div>

            <div className="item-totals">
              Total Quantity: {totalQty}
            </div>
          </div>

          <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '1rem', marginTop: '2rem' }}>
            <button type="button" className="btn btn-secondary" onClick={() => navigate('/challans')}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={submitting}>
              {submitting ? 'Saving...' : 'Save as Draft'}
            </button>
          </div>

        </form>
      </div>
    </div>
  );
};

export default CreateChallanPage;
