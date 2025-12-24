import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import { useAuth } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  const { login, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (isAuthenticated && user) {
      const paths = { admin: '/admin/dashboard', owner: '/owner/dashboard', tenant: '/tenant/dashboard' };
      navigate(paths[user.role] || '/');
    }
  }, [isAuthenticated, user, navigate]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    const result = await login(email, password);
    setLoading(false);
    if (!result.success) setError(result.error);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--color-bg-light)] flex items-center justify-center py-12 px-4">
        <div className="card max-w-md w-full p-8">
          <h2 className="text-center text-3xl font-bold mb-2">Welcome Back</h2>
          <p className="text-center text-gray-500 mb-8">Login to your account</p>

          {location.state?.message && <div className="alert-success mb-4">{location.state.message}</div>}
          {error && <div className="alert-error mb-4">{error}</div>}

          <form className="space-y-6" onSubmit={handleSubmit}>
            <div>
              <label className="form-label">Email Address</label>
              <input type="email" required className="input-ui" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="form-label">Password</label>
              <input type="password" required className="input-ui" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
            <button type="submit" disabled={loading} className="btn-secondary w-full">
              {loading ? 'Signing in...' : 'Sign In'}
            </button>
          </form>

          <div className="mt-6 text-center space-y-3">
            <p className="text-sm">New here? <Link to="/signup" className="text-[var(--color-secondary)] font-bold">Create account</Link></p>
            {/* <Link to="/admin-login" className="block text-xs text-gray-400 hover:text-[var(--color-primary)]">Admin Login</Link> */}
          </div>
        </div>
      </div>
    </>
  );
};

export default Login;