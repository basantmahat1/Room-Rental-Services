import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';


const AdminLogin = () => {
  const [email, setEmail] = useState('basant2003@gmail.com');
  const [password, setPassword] = useState('Admin@admin123');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const { adminLogin, isAuthenticated, user } = useAuth();
  const navigate = useNavigate();

  // useEffect(() => {
  //   if (isAuthenticated && user?.role === 'admin') {
  //     navigate('/admin/dashboard');
  //   }
  // }, [isAuthenticated, user, navigate]);

const handleSubmit = async (e) => {
  e.preventDefault();
  setError('');
  setLoading(true);
  try {
    const res = await fetch('http://localhost:5000/api/auth/admin/login', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    });

    const data = await res.json(); // Pahila JSON parse garne

    if (!res.ok) {
      setError(data.message || 'Login failed');
      return;
    }

    console.log('Admin login success:', data);

    // 1. Context ko adminLogin call garera state update garne (Yadi Context ma logic chha bhane)
    // Athawa direct data set garne (Yadi Context milako chha bhane)
    
    // 2. Token ra User save garne (Important!)
    localStorage.setItem('accessToken', data.accessToken);
    localStorage.setItem('user', JSON.stringify(data.user));

    // 3. Navigate garne
    if (data.user?.role === 'admin') {
       navigate('/admin/dashboard');
       window.location.reload(); // State refresh garna (Yadi login bhayepachi dashboard blank aayo bhane)
    }

  } catch (err) {
    setError('An unexpected error occurred');
  } finally {
    setLoading(false);
  }
};
  return (
    <>
      <Navbar />
      <div className="min-h-screen bg-[var(--color-primary)] flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full">
          <div className="bg-white py-8 px-10 shadow-custom rounded-xl">
            <div className="text-center mb-8">
              <div className="mx-auto h-12 w-12 bg-[var(--color-secondary)] rounded-full flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-xl">A</span>
              </div>
              <h2 className="mt-6 text-3xl font-extrabold">Admin Access</h2>
            </div>
            
            {error && <div className="alert-error mb-4">{error}</div>}
            
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div>
                <label className="form-label">Admin Email</label>
                <input
                  type="email"
                  required
                  className="input-ui"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                />
              </div>
              <div>
                <label className="form-label">Password</label>
                <input
                  type="password"
                  required
                  className="input-ui"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
              </div>
              <button type="submit" disabled={loading} className="btn-primary w-full flex justify-center items-center">
                {loading ? <div className="spinner h-5 w-5 border-white mr-2"></div> : 'Login to Dashboard'}
              </button>
            </form>
          </div>
        </div>
      </div>
    </>
  );
};

export default AdminLogin;