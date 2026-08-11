import React, { useEffect, useState } from 'react';
import { Plus, Search, Edit, Activity, Navigation } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import ProductFormModal from './ProductFormModal';
import StockAdjustmentModal from './StockAdjustmentModal';
import StockMovementLog from './StockMovementLog';
import './products.css';

interface Product {
  id: string;
  name: string;
  sku: string;
  category: string;
  unitPrice: number;
  currentStock: number;
  minStockAlert: number;
  location: string;
}

const ProductsPage: React.FC = () => {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  
  // Modals state
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [isStockModalOpen, setIsStockModalOpen] = useState(false);
  const [isLogModalOpen, setIsLogModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<Product | null>(null);

  const fetchProducts = async () => {
    try {
      setLoading(true);
      const res = await api.get(`/products?search=${search}`);
      setProducts(res.data.data.items || res.data.data);
    } catch (error) {
      toast.error('Failed to load products');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    const delayDebounceFn = setTimeout(() => {
      fetchProducts();
    }, 500);
    return () => clearTimeout(delayDebounceFn);
  }, [search]);

  const handleAction = (action: 'edit' | 'adjust' | 'log', product: Product) => {
    setSelectedProduct(product);
    if (action === 'edit') setIsProductModalOpen(true);
    if (action === 'adjust') setIsStockModalOpen(true);
    if (action === 'log') setIsLogModalOpen(true);
  };

  return (
    <div className="products-page">
      <div className="page-header">
        <div>
          <h1>Inventory</h1>
          <p>Manage products and stock movements</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setSelectedProduct(null); setIsProductModalOpen(true); }}>
          <Plus size={18} /> Add Product
        </button>
      </div>

      <div className="card">
        <div className="table-toolbar">
          <div className="search-box">
            <Search size={18} className="search-icon" />
            <input
              type="text"
              placeholder="Search by name, SKU or category..."
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
                <th>SKU</th>
                <th>Product Name</th>
                <th>Category</th>
                <th>Unit Price</th>
                <th>Stock</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan={6} className="text-center">Loading...</td></tr>
              ) : products.length === 0 ? (
                <tr><td colSpan={6} className="text-center">No products found.</td></tr>
              ) : (
                products.map((p) => {
                  const isLowStock = p.currentStock <= p.minStockAlert;
                  return (
                    <tr key={p.id}>
                      <td className="font-medium text-tertiary">{p.sku}</td>
                      <td className="font-medium">{p.name}</td>
                      <td><span className="badge badge-neutral">{p.category}</span></td>
                      <td>${Number(p.unitPrice).toFixed(2)}</td>
                      <td>
                        <div className="stock-info">
                          <span className={isLowStock ? 'text-danger font-medium' : ''}>{p.currentStock}</span>
                          {isLowStock && <span className="badge badge-danger ml-2">Low Stock</span>}
                        </div>
                      </td>
                      <td>
                        <div className="action-buttons">
                          <button className="btn-icon" title="Adjust Stock" onClick={() => handleAction('adjust', p)}>
                            <Activity size={18} />
                          </button>
                          <button className="btn-icon" title="View Logs" onClick={() => handleAction('log', p)}>
                            <Navigation size={18} />
                          </button>
                          <button className="btn-icon" title="Edit" onClick={() => handleAction('edit', p)}>
                            <Edit size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {isProductModalOpen && (
        <ProductFormModal product={selectedProduct} onClose={(r) => { setIsProductModalOpen(false); if(r) fetchProducts(); }} />
      )}
      {isStockModalOpen && selectedProduct && (
        <StockAdjustmentModal product={selectedProduct} onClose={(r) => { setIsStockModalOpen(false); if(r) fetchProducts(); }} />
      )}
      {isLogModalOpen && selectedProduct && (
        <StockMovementLog productId={selectedProduct.id} onClose={() => setIsLogModalOpen(false)} />
      )}
    </div>
  );
};

export default ProductsPage;
