import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { api } from '../../utils/api';

interface StockAdjustmentModalProps {
  product: any;
  onClose: (refresh?: boolean) => void;
}

const StockAdjustmentModal: React.FC<StockAdjustmentModalProps> = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    movementType: 'IN',
    quantity: 1,
    reason: '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (formData.quantity <= 0) {
      return toast.error('Quantity must be greater than zero');
    }
    
    setLoading(true);
    try {
      await api.post(`/products/${product.id}/stock-adjustment`, formData);
      toast.success('Stock adjusted successfully');
      onClose(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to adjust stock');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose()}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <div>
            <h2>Adjust Stock</h2>
            <p className="text-small text-tertiary">Product: {product.name} ({product.sku})</p>
          </div>
          <button className="btn-icon" onClick={() => onClose()}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label className="form-label">Current Stock</label>
              <input type="text" className="form-input bg-gray-100" value={product.currentStock} disabled />
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Movement Type *</label>
                <select name="movementType" className="form-select" value={formData.movementType} onChange={handleChange}>
                  <option value="IN">Stock IN (Add)</option>
                  <option value="OUT">Stock OUT (Remove)</option>
                </select>
              </div>
              <div className="form-group">
                <label className="form-label">Quantity *</label>
                <input required type="number" min="1" name="quantity" className="form-input" value={formData.quantity} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Reason *</label>
              <input required type="text" name="reason" className="form-input" value={formData.reason} onChange={handleChange} placeholder="e.g. New shipment received" />
            </div>
            
            <p className="text-small text-tertiary mt-4">
              <strong>New Stock will be:</strong> {
                formData.movementType === 'IN' 
                ? product.currentStock + formData.quantity 
                : product.currentStock - formData.quantity
              }
            </p>
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => onClose()}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Processing...' : 'Confirm Adjustment'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default StockAdjustmentModal;
