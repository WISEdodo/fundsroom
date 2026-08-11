import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { Users, Package, FileText, TrendingUp } from 'lucide-react';
import './dashboard.css';

const DashboardPage: React.FC = () => {
  const { user } = useAuth();

  const stats = [
    { label: 'Total Customers', value: '1,240', icon: <Users size={24} />, color: 'var(--primary)' },
    { label: 'Low Stock Items', value: '12', icon: <Package size={24} />, color: 'var(--warning)' },
    { label: 'Pending Challans', value: '8', icon: <FileText size={24} />, color: 'var(--secondary)' },
    { label: 'Monthly Sales', value: '$45,200', icon: <TrendingUp size={24} />, color: 'var(--success)' },
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
            <button className="btn btn-primary">Create Challan</button>
            <button className="btn btn-secondary">Add Customer</button>
            <button className="btn btn-secondary">Adjust Stock</button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DashboardPage;
