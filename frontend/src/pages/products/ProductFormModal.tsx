import React, { useState } from 'react';
import toast from 'react-hot-toast';
import { X } from 'lucide-react';
import { api } from '../../utils/api';

interface ProductFormModalProps {
  product: any | null;
  onClose: (refresh?: boolean) => void;
}

const ProductFormModal: React.FC<ProductFormModalProps> = ({ product, onClose }) => {
  const [formData, setFormData] = useState({
    name: product?.name || '',
    sku: product?.sku || '',
    category: product?.category || '',
    unitPrice: product?.unitPrice || '',
    currentStock: product?.currentStock || 0,
    minStockAlert: product?.minStockAlert || 10,
    location: product?.location || '',
  });
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type } = e.target;
    setFormData(prev => ({ 
      ...prev, 
      [name]: type === 'number' ? Number(value) : value 
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      if (product) {
        // Exclude currentStock when updating, it must be updated via stock adjustments
        const { currentStock, ...updateData } = formData;
        await api.put(`/products/${product.id}`, updateData);
        toast.success('Product updated successfully');
      } else {
        await api.post('/products', formData);
        toast.success('Product added successfully');
      }
      onClose(true);
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Failed to save product');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="modal-overlay" onClick={() => onClose()}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{product ? 'Edit Product' : 'Add New Product'}</h2>
          <button className="btn-icon" onClick={() => onClose()}>
            <X size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Product Name *</label>
                <input required type="text" name="name" className="form-input" value={formData.name} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">SKU / Code *</label>
                <input required type="text" name="sku" className="form-input" value={formData.sku} onChange={handleChange} disabled={!!product} />
              </div>
            </div>

            <div className="grid-2">
              <div className="form-group">
                <label className="form-label">Category *</label>
                <input required type="text" name="category" className="form-input" value={formData.category} onChange={handleChange} />
              </div>
              <div className="form-group">
                <label className="form-label">Unit Price ($) *</label>
                <input required type="number" step="0.01" min="0" name="unitPrice" className="form-input" value={formData.unitPrice} onChange={handleChange} />
              </div>
            </div>

            <div className="grid-2">
              {!product && (
                <div className="form-group">
                  <label className="form-label">Initial Stock</label>
                  <input type="number" min="0" name="currentStock" className="form-input" value={formData.currentStock} onChange={handleChange} />
                </div>
              )}
              <div className="form-group">
                <label className="form-label">Min Stock Alert</label>
                <input type="number" min="0" name="minStockAlert" className="form-input" value={formData.minStockAlert} onChange={handleChange} />
              </div>
            </div>

            <div className="form-group">
              <label className="form-label">Warehouse Location</label>
              <input type="text" name="location" className="form-input" value={formData.location} onChange={handleChange} placeholder="e.g. Warehouse A - Rack 3" />
            </div>
            
            {product && (
              <p className="text-small text-tertiary mt-4">Note: To update stock quantity, please use the Stock Adjustment action from the inventory list.</p>
            )}
          </div>
          
          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={() => onClose()}>Cancel</button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? 'Saving...' : 'Save Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ProductFormModal;
