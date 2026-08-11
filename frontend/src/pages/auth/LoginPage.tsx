import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { LogIn } from 'lucide-react';
import toast from 'react-hot-toast';
import { api } from '../../utils/api';
import { useAuth } from '../../context/AuthContext';
import './auth.css';

const LoginPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    
    try {
      const response = await api.post('/auth/login', { email, password });
      if (response.data.success) {
        login(response.data.data.token, response.data.data.user);
        toast.success('Login successful!');
        navigate('/');
      }
    } catch (error: any) {
      toast.error(error.response?.data?.error?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="login-container">
      <div className="login-card card animate-fade-in">
        <div className="login-header">
          <div className="login-logo">
            <LogIn size={32} color="var(--primary)" />
          </div>
          <h1>Welcome Back</h1>
          <p>Login to your ERP Portal</p>
        </div>

        <form onSubmit={handleSubmit} className="login-form">
          <div className="form-group">
            <label className="form-label">Email Address</label>
            <input
              type="email"
              className="form-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@erp.com"
              required
            />
          </div>
          <div className="form-group">
            <label className="form-label">Password</label>
            <input
              type="password"
              className="form-input"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="••••••••"
              required
            />
          </div>
          <button type="submit" className="btn btn-primary login-btn" disabled={loading}>
            {loading ? 'Authenticating...' : 'Sign In'}
          </button>
        </form>

        <div className="login-footer">
          <p>Test Credentials:</p>
          <ul>
            <li>admin@erp.com</li>
            <li>sales@erp.com</li>
            <li>warehouse@erp.com</li>
            <li>accounts@erp.com</li>
            <li>(Password: password123)</li>
          </ul>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;
