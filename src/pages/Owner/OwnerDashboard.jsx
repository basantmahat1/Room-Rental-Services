import React, { useState } from 'react';
import { useAuth } from '../../context/AuthContext';
import { authAPI } from '../../services/api';

const OwnerDashboard = () => {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);

  const testOwnerAPI = async () => {
    setLoading(true);
    try {
      const res = await authAPI.testOwner();
      setTestResult(`API Test Successful: ${res.data.message}`);
    } catch (err) {
      setTestResult(
        `API Test Failed: ${err.response?.data?.message || err.message}`
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-8 p-6">
      {/* ================= WELCOME ================= */}
      <div className="bg-gradient-to-r from-[var(--color-primary)] to-[var(--color-secondary)] rounded-2xl p-8 text-white shadow-lg">
        <h1 className="text-4xl font-bold mb-2">
          Welcome back, {user?.name} 👋
        </h1>
        <p className="text-white/90">
          Owner Dashboard • Manage your properties easily
        </p>
      </div>

      {/* ================= STATS ================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[
          { label: 'Total Properties', value: '15', extra: '+2 this month', icon: '🏠' },
          { label: 'Occupied', value: '12', extra: '80% occupancy', icon: '✓' },
          { label: 'Monthly Revenue', value: '$45,000', extra: '+12% growth', icon: '💰' },
        ].map((item, i) => (
          <div key={i} className="card p-6 border border-[var(--color-border)]">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-[var(--color-muted)] font-semibold">{item.label}</p>
                <p className="text-4xl font-bold text-[var(--color-primary)] mt-1">
                  {item.value}
                </p>
                <p className="text-sm text-[var(--color-secondary)] mt-2">
                  {item.extra}
                </p>
              </div>
              <div className="w-14 h-14 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center justify-center text-2xl">
                {item.icon}
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* ================= QUICK ACTIONS ================= */}
      <div className="form-section">
        <h2 className="section-title text-[var(--color-primary)] font-bold mb-4">Quick Actions</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
          {[
            { title: 'Add Property', desc: 'List new room or flat', icon: '➕' },
            { title: 'Analytics', desc: 'View performance', icon: '📊' },
            { title: 'Bookings', desc: 'Manage reservations', icon: '📅' },
            { title: 'Messages', desc: 'Reply to users', icon: '💬' },
          ].map((item, i) => (
            <button
              key={i}
              className="p-6 rounded-xl border border-[var(--color-primary)]/20
                         hover:border-[var(--color-primary)]
                         hover:shadow-lg transition-all text-left group bg-[var(--color-card)]"
            >
              <div className="text-3xl mb-3 group-hover:scale-110 transition-transform">
                {item.icon}
              </div>
              <div className="font-bold text-[var(--color-primary)]">{item.title}</div>
              <div className="text-sm text-[var(--color-muted)]">{item.desc}</div>
            </button>
          ))}
        </div>
      </div>

      {/* ================= RECENT PROPERTIES ================= */}
      <div className="form-section">
        <h2 className="section-title text-[var(--color-primary)] font-bold mb-4">Recent Properties</h2>
        <div className="space-y-4">
          {[
            { name: 'Luxury Penthouse', status: 'Occupied', price: '$5,000' },
            { name: 'Downtown Studio', status: 'Available', price: '$1,200' },
            { name: 'Family Villa', status: 'Maintenance', price: '$3,800' },
          ].map((p, i) => (
            <div key={i} className="card p-5 hover:shadow-lg transition bg-[var(--color-card)] border border-[var(--color-border)]">
              <div className="flex items-center justify-between">
                <div className="flex gap-4 items-center">
                  <div className="w-12 h-12 rounded-lg bg-gradient-to-br from-[var(--color-primary)] to-[var(--color-secondary)] text-white flex items-center justify-center">
                    🏠
                  </div>
                  <div>
                    <p className="font-bold text-[var(--color-primary)]">{p.name}</p>
                    <span className={`badge-${p.status === 'Occupied' ? 'success' : p.status === 'Available' ? 'info' : 'warning'} mt-1`}>
                      {p.status}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-2xl font-bold text-[var(--color-secondary)]">{p.price}</p>
                  <p className="text-sm text-[var(--color-muted)]">per month</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* ================= API TEST ================= */}
      <div className="form-section">
        <h2 className="section-title text-[var(--color-primary)] font-bold mb-4">API Test</h2>
        <button onClick={testOwnerAPI} disabled={loading} className="btn-primary">
          {loading ? (
            <div className="flex items-center gap-2">
              <div className="spinner w-5 h-5"></div>
              Testing...
            </div>
          ) : (
            'Test Owner API'
          )}
        </button>
        {testResult && (
          <div className={`mt-4 ${testResult.includes('Successful') ? 'alert-success' : 'alert-error'}`}>
            {testResult}
          </div>
        )}
      </div>
    </div>
  );
};

export default OwnerDashboard;
