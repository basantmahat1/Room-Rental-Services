import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Layout/Navbar';
import { useAuth } from '../context/AuthContext';

const Signup = () => {
  const [formData, setFormData] = useState({
    name: '', email: '', password: '', confirmPassword: '', role: 'tenant'
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { signup } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    setLoading(true);
    const result = await signup(formData);
    setLoading(false);
    if (result.success) navigate('/login', { state: { message: 'Registration successful!' } });
    else setError(result.error);
  };

  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--color-bg-light)] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8 bg-white p-8 rounded-xl shadow-sm border border-gray-200">
          <h2 className="text-center text-3xl font-bold text-gradient">Create Account</h2>
          
          <form className="space-y-5" onSubmit={handleSubmit}>
            {error && <div className="alert-error">{error}</div>}
            
            <div>
              <label className="form-label">Full Name</label>
              <input name="name" type="text" required className="input-ui" onChange={handleChange} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div
                onClick={() => setFormData({...formData, role: 'tenant'})}
                className={formData.role === 'tenant' ? 'selection-btn-active' : 'selection-btn'}
              >
                <span className="block text-xl">👤</span>
                <span className="font-bold">Tenant</span>
              </div>
              <div
                onClick={() => setFormData({...formData, role: 'owner'})}
                className={formData.role === 'owner' ? 'selection-btn-active' : 'selection-btn'}
              >
                <span className="block text-xl">🏢</span>
                <span className="font-bold">Owner</span>
              </div>
            </div>

            <div>
              <label className="form-label">Email</label>
              <input name="email" type="email" required className="input-ui" onChange={handleChange} />
            </div>

            <div>
              <label className="form-label">Password</label>
              <input name="password" type="password" required className="input-ui" onChange={handleChange} />
            </div>

            <button type="submit" disabled={loading} className="btn-primary w-full">
              {loading ? 'Creating...' : `Sign up as ${formData.role}`}
            </button>
            
            <p className="text-center text-sm">
              Already have an account? <Link to="/login" className="text-[var(--color-secondary)] font-bold">Sign in</Link>
            </p>
          </form>
        </div>
      </div>
    </>
  );
};

export default Signup;