import React from 'react';
import { NavLink } from 'react-router-dom';
import { LayoutDashboard, Users, Package, FileText, LogOut } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import './layout.css';

const Sidebar: React.FC = () => {
  const { user, logout } = useAuth();

  const navItems = [
    { name: 'Dashboard', path: '/', icon: <LayoutDashboard size={20} />, roles: ['admin', 'sales', 'warehouse', 'accounts'] },
    { name: 'Customers', path: '/customers', icon: <Users size={20} />, roles: ['admin', 'sales', 'accounts'] },
    { name: 'Inventory', path: '/products', icon: <Package size={20} />, roles: ['admin', 'warehouse', 'sales'] },
    { name: 'Sales Challans', path: '/challans', icon: <FileText size={20} />, roles: ['admin', 'sales', 'accounts', 'warehouse'] },
  ];

  const authorizedItems = navItems.filter(item => user?.role && item.roles.includes(user.role));

  return (
    <aside className="sidebar">
      <div className="sidebar-header">
        <h2>ERP Portal</h2>
      </div>
      <nav className="sidebar-nav">
        {authorizedItems.map((item) => (
          <NavLink
            key={item.path}
            to={item.path}
            className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`}
          >
            {item.icon}
            <span>{item.name}</span>
          </NavLink>
        ))}
      </nav>
      <div className="sidebar-footer">
        <button onClick={logout} className="nav-item text-danger">
          <LogOut size={20} />
          <span>Logout</span>
        </button>
      </div>
    </aside>
  );
};

export default Sidebar;
