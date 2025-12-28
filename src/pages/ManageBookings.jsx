// ========================================
// pages/ManageBookings.jsx (COMPACT, SAME THEME)
// ========================================
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../services/api';

const ManageBookings = () => {
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const res = await bookingAPI.getAll(params);
      setBookings(res.data.bookings || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await bookingAPI.updateStatus(id, status);
      loadBookings();
    } catch {
      alert('Failed to update booking');
    }
  };

  const statusStyle = (status) => {
    switch (status) {
      case 'pending':
        return 'bg-[var(--color-warning)]/20 text-[var(--color-warning)] border-[var(--color-warning)]';
      case 'accepted':
        return 'bg-[var(--color-success)]/20 text-[var(--color-success)] border-[var(--color-success)]';
      case 'rejected':
        return 'bg-[var(--color-accent)]/20 text-[var(--color-accent)] border-[var(--color-accent)]';
      case 'completed':
        return 'bg-blue-100 text-blue-800 border-blue-300';
      default:
        return 'bg-gray-100 text-gray-700 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="spinner h-10 w-10" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] p-4">
      <div className="max-w-7xl mx-auto space-y-4">

        {/* HEADER */}
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">🏢 Manage Bookings</h1>
          <div className="bg-white border rounded-lg px-4 py-2 text-center">
            <div className="text-xl font-bold">{bookings.length}</div>
            <div className="text-xs text-gray-600">Total</div>
          </div>
        </div>

        {/* FILTER */}
        <div className="form-section-compact">
          <div className="flex flex-wrap gap-2">
            {['all','pending','accepted','rejected','completed','cancelled'].map(s => (
              <button
                key={s}
                onClick={() => setFilter(s)}
                className={`px-4 py-1.5 rounded-lg border-2 font-semibold capitalize transition ${
                  filter === s
                    ? 'bg-[var(--color-secondary)] text-white border-[var(--color-secondary)]'
                    : 'bg-white border-gray-300 hover:border-[var(--color-secondary)]'
                }`}
              >
                {s}
              </button>
            ))}
          </div>
        </div>

        {/* EMPTY */}
        {bookings.length === 0 && (
          <div className="form-section-compact text-center py-10">
            <div className="text-6xl mb-3">📭</div>
            <p className="text-gray-600">No booking requests found</p>
          </div>
        )}

        {/* BOOKINGS */}
        <div className="space-y-4">
          {bookings.map(b => (
            <div key={b.id} className="form-section-compact hover:shadow-md transition">

              <div className="flex flex-col md:flex-row gap-4">

                {/* IMAGE */}
                <div className="md:w-56 h-40 rounded-xl overflow-hidden relative">
                  <img
                    src={b.property_image || '/placeholder.jpg'}
                    alt=""
                    className="w-full h-full object-cover"
                  />
                  <span className="absolute top-2 left-2 bg-black/70 text-white text-xs px-2 py-1 rounded">
                    ${b.property_price}/mo
                  </span>
                </div>

                {/* CONTENT */}
                <div className="flex-1 space-y-3">

                  <div className="flex justify-between items-start">
                    <div>
                      <Link
                        to={`/properties/${b.property_id}`}
                        className="text-lg font-bold hover:underline"
                      >
                        {b.property_title}
                      </Link>
                      <p className="text-sm text-gray-600">📍 {b.property_address}</p>
                    </div>

                    <span className={`px-3 py-1 text-xs font-bold border-2 rounded-lg uppercase ${statusStyle(b.status)}`}>
                      {b.status}
                    </span>
                  </div>

                  {/* TENANT */}
                  <div className="bg-[var(--color-bg-light)] p-3 rounded-lg grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
                    <div>
                      <div className="text-gray-600">Name</div>
                      <div className="font-bold">{b.tenant_name}</div>
                    </div>
                    <div>
                      <div className="text-gray-600">Email</div>
                      <div className="font-bold">{b.tenant_email}</div>
                    </div>
                    {b.tenant_phone && (
                      <div>
                        <div className="text-gray-600">Phone</div>
                        <div className="font-bold">{b.tenant_phone}</div>
                      </div>
                    )}
                  </div>

                  {/* DATES */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm">
                    <div className="bg-gray-100 p-2 rounded">
                      <div className="text-gray-500">Move-in</div>
                      <div className="font-bold">
                        {new Date(b.start_date).toLocaleDateString()}
                      </div>
                    </div>

                    {b.end_date && (
                      <div className="bg-gray-100 p-2 rounded">
                        <div className="text-gray-500">Move-out</div>
                        <div className="font-bold">
                          {new Date(b.end_date).toLocaleDateString()}
                        </div>
                      </div>
                    )}

                    <div className="bg-gray-100 p-2 rounded">
                      <div className="text-gray-500">Rent</div>
                      <div className="font-bold text-[var(--color-secondary)]">
                        ${b.property_price}
                      </div>
                    </div>
                  </div>

                  {/* MESSAGE */}
                  {b.message && (
                    <div className="bg-green-50 border border-green-200 p-2 rounded text-sm italic">
                      💬 {b.message}
                    </div>
                  )}

                  {/* ACTIONS */}
                  <div className="flex flex-wrap gap-2 pt-3 border-t">
                    {b.status === 'pending' && (
                      <>
                        <button
                          onClick={() => updateStatus(b.id, 'accepted')}
                          className="btn-primary px-4 py-1.5 text-sm"
                        >
                          ✅ Accept
                        </button>
                        <button
                          onClick={() => updateStatus(b.id, 'rejected')}
                          className="btn-danger px-4 py-1.5 text-sm"
                        >
                          ❌ Reject
                        </button>
                      </>
                    )}

                    {b.status === 'accepted' && (
                      <button
                        onClick={() => updateStatus(b.id, 'completed')}
                        className="btn-secondary px-4 py-1.5 text-sm"
                      >
                        🏁 Complete
                      </button>
                    )}

                    <Link
                      to={`/properties/${b.property_id}`}
                      className="btn-outline px-4 py-1.5 text-sm"
                    >
                      👁 View
                    </Link>
                  </div>

                </div>
              </div>
            </div>
          ))}
        </div>

      </div>
    </div>
  );
};

export default ManageBookings;
