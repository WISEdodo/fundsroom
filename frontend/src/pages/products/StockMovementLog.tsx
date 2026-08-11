import React, { useEffect, useState } from 'react';
import toast from 'react-hot-toast';
import { X, ArrowDownRight, ArrowUpRight } from 'lucide-react';
import { api } from '../../utils/api';

interface StockMovementLogProps {
  productId: string;
  onClose: () => void;
}

const StockMovementLog: React.FC<StockMovementLogProps> = ({ productId, onClose }) => {
  const [logs, setLogs] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get(`/products/${productId}/stock-movements`);
        setLogs(res.data.data);
      } catch (error) {
        toast.error('Failed to load stock movements');
      } finally {
        setLoading(false);
      }
    };
    fetchLogs();
  }, [productId]);

  return (
    <div className="modal-overlay" onClick={() => onClose()}>
      <div className="modal-content" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Stock Movement Log</h2>
          <button className="btn-icon" onClick={() => onClose()}>
            <X size={20} />
          </button>
        </div>
        
        <div className="modal-body" style={{ maxHeight: '60vh' }}>
          {loading ? (
            <p className="text-center text-tertiary">Loading logs...</p>
          ) : logs.length === 0 ? (
            <p className="text-center text-tertiary">No stock movements found.</p>
          ) : (
            <div className="movement-log-list">
              {logs.map((log: any) => {
                const isIn = log.movementType === 'IN';
                return (
                  <div key={log.id} className="movement-log-item">
                    <div className="movement-header">
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        {isIn ? <ArrowDownRight size={18} className="qty-in" /> : <ArrowUpRight size={18} className="qty-out" />}
                        <span className={`movement-qty ${isIn ? 'qty-in' : 'qty-out'}`}>
                          {isIn ? '+' : '-'}{log.quantity}
                        </span>
                      </div>
                      <span className="badge badge-neutral">{log.movementType}</span>
                    </div>
                    <div className="movement-meta">
                      <span><strong>Reason:</strong> {log.reason}</span>
                    </div>
                    <div className="movement-meta mt-1">
                      <span>By: {log.user?.name}</span>
                      <span>{new Date(log.createdAt).toLocaleString()}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default StockMovementLog;
