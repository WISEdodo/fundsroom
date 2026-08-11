import React from 'react';
import { useAuth } from '../../context/AuthContext';
import { User } from 'lucide-react';
import './layout.css';

const Header: React.FC = () => {
  const { user } = useAuth();

  return (
    <header className="header">
      <div className="header-title">
        {/* Placeholder for dynamic title or breadcrumbs */}
      </div>
      <div className="header-user">
        <div className="user-info">
          <span className="user-name">{user?.name}</span>
          <span className="user-role badge badge-primary">{user?.role}</span>
        </div>
        <div className="user-avatar">
          <User size={20} />
        </div>
      </div>
    </header>
  );
};

export default Header;
