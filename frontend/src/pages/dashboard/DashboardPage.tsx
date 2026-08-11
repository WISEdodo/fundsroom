import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Users, Package, FileText, TrendingUp } from 'lucide-react';
import { api } from '../../utils/api';
import toast from 'react-hot-toast';
import './dashboard.css';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [statsData, setStatsData] = useState({
    totalCustomers: 0,
    lowStockItems: 0,
    pendingChallans: 0,
    monthlySales: 0,
  });

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const res = await api.get('/dashboard/stats');
        setStatsData(res.data.data);
      } catch (error) {
        toast.error('Failed to load dashboard stats');
      }
    };
    fetchStats();
  }, []);

  const stats = [
    { label: 'Total Customers', value: statsData.totalCustomers, icon: <Users size={24} />, color: 'var(--primary)' },
    { label: 'Low Stock Items', value: statsData.lowStockItems, icon: <Package size={24} />, color: 'var(--warning)' },
    { label: 'Pending Challans', value: statsData.pendingChallans, icon: <FileText size={24} />, color: 'var(--secondary)' },
    { label: 'Monthly Sales', value: statsData.monthlySales, icon: <TrendingUp size={24} />, color: 'var(--success)' },
  ];

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h1>Welcome back, {user?.name}</h1>
          <p>Here is what's happening with your business today.</p>
        </div>
      </div>

      <div className="grid-4">
        {stats.map((stat, idx) => (
          <div className="card stat-card" key={idx}>
            <div className="stat-icon" style={{ backgroundColor: `${stat.color}20`, color: stat.color }}>
              {stat.icon}
            </div>
            <div className="stat-info">
              <h3>{stat.value}</h3>
              <p>{stat.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid-2 mt-4">
        <div className="card">
          <h2>Recent Activity</h2>
          <div className="empty-state">
            <p>Activity feed will appear here</p>
          </div>
        </div>
        <div className="card">
          <h2>Quick Actions</h2>
          <div className="quick-actions">
            <button className="btn btn-primary" onClick={() => navigate('/challans/create')}>Create Challan</button>
            <button className="btn btn-secondary" onClick={() => navigate('/customers?action=add')}>Add Customer</button>
            <button className="btn btn-secondary" onClick={() => navigate('/products?action=adjust')}>Adjust Stock</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
