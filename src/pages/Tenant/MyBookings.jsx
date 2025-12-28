import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { bookingAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const MyBookings = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    loadBookings();
  }, [filter]);

  const loadBookings = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await bookingAPI.getAll(params);
      setBookings(response.data.bookings);
    } catch (error) {
      console.error('Error loading bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = async (bookingId) => {
    if (!confirm('Are you sure you want to cancel this booking?')) return;

    try {
      await bookingAPI.cancel(bookingId);
      alert('Booking cancelled successfully');
      loadBookings();
    } catch (error) {
      alert(error.response?.data?.message || 'Failed to cancel booking');
    }
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'accepted': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'cancelled': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'completed': return 'bg-blue-100 text-blue-800 border-blue-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading bookings...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 px-4 py-6">
      <div className="max-w-7xl mx-auto space-y-4">
        {/* Header - Compact */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-primary)] mb-1">📅 My Bookings</h1>
            <p className="text-sm text-gray-600">Manage your property bookings</p>
          </div>
          <Link
            to="/"
            className="btn-primary px-4 py-2 text-sm font-bold flex items-center gap-1"
          >
            <span>🔍</span> Find Properties
          </Link>
        </div>

        {/* Filter Tabs - Compact */}
        <div className="bg-white rounded-lg p-3 border border-gray-200 shadow-sm">
          <div className="mb-2 text-sm font-semibold text-gray-800">Filter by Status:</div>
          <div className="flex flex-wrap gap-2">
            {['all', 'pending', 'accepted', 'rejected', 'cancelled', 'completed'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-3 py-1.5 rounded-lg text-sm font-bold capitalize transition-all duration-200 border ${
                  filter === status
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)] shadow'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--color-primary)] hover:bg-[var(--color-primary-light)]'
                }`}
              >
                {status === 'all' ? 'All' : status}
              </button>
            ))}
          </div>
        </div>

        {/* Bookings List */}
        {bookings.length === 0 ? (
          <div className="bg-white rounded-lg border border-gray-200 p-6 text-center">
            <div className="text-5xl mb-4 text-gray-400">📅</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No bookings found</h2>
            <p className="text-sm text-gray-600 mb-6 max-w-md mx-auto">
              You haven't made any bookings yet. Start exploring amazing properties!
            </p>
            <div className="flex flex-col sm:flex-row gap-3 justify-center">
              <Link to="/" className="btn-primary px-6 py-2 text-sm font-bold">🏠 Browse Properties</Link>
              <Link to="/favorites" className="btn-secondary px-6 py-2 text-sm font-bold">❤️ Favorites</Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="text-sm font-semibold text-gray-800">
              {bookings.length} booking{bookings.length !== 1 ? 's' : ''}
            </div>

            {bookings.map((booking) => (
              <div key={booking.id} className="bg-white rounded-lg border border-gray-200 overflow-hidden hover:shadow-md transition-all duration-300">
                <div className="md:flex">
                  {/* Property Image - Smaller */}
                  <div className="md:w-48 h-40 md:h-auto">
                    <img
                      src={booking.property_image || '/placeholder.jpg'}
                      alt={booking.property_title}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  {/* Booking Details - Compact */}
                  <div className="flex-1 p-4">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-3 mb-4">
                      <div className="flex-1">
                        <h3 className="text-lg font-bold text-[var(--color-primary)] mb-1">
                          <Link
                            to={`/properties/${booking.property_id}`}
                            className="hover:text-[var(--color-primary-dark)] hover:underline"
                          >
                            {booking.property_title}
                          </Link>
                        </h3>
                        <div className="flex items-center gap-1 text-gray-600 text-sm mb-1">
                          <span>📍</span>
                          <span className="truncate">{booking.property_address}</span>
                        </div>
                        <div className="text-base font-bold text-[var(--color-accent)] mt-1">
                          ${booking.property_price} <span className="text-xs font-normal text-gray-600">/ month</span>
                        </div>
                      </div>
                      <div className="flex flex-col items-end gap-2">
                        <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wide ${getStatusColor(booking.status)}`}>
                          {booking.status}
                        </span>
                        <div className="text-xs text-gray-500">
                          {new Date(booking.created_at).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                            year: 'numeric'
                          })}
                        </div>
                      </div>
                    </div>

                    {/* Dates and Owner - Compact */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                          <span>📅</span> Move-in
                        </div>
                        <div className="font-bold text-sm">
                          {new Date(booking.start_date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric'
                          })}
                        </div>
                      </div>

                      {booking.end_date && (
                        <div className="bg-gray-50 p-3 rounded-lg">
                          <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                            <span>📅</span> Move-out
                          </div>
                          <div className="font-bold text-sm">
                            {new Date(booking.end_date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric'
                            })}
                          </div>
                        </div>
                      )}

                      <div className="bg-gray-50 p-3 rounded-lg">
                        <div className="text-xs text-gray-600 mb-1 flex items-center gap-1">
                          <span>💬</span> Owner
                        </div>
                        <div className="font-bold text-sm truncate">
                          {booking.owner_name || 'N/A'}
                        </div>
                      </div>
                    </div>

                    {/* Message - Compact */}
                    {booking.message && (
                      <div className="bg-blue-50 border border-blue-300 p-3 rounded-lg mb-4">
                        <div className="text-xs font-semibold text-blue-800 mb-1 flex items-center gap-1">
                          <span>💭</span> Your Message:
                        </div>
                        <p className="text-sm text-gray-800 italic truncate">"{booking.message}"</p>
                      </div>
                    )}

               {booking.status === 'accepted' && booking.payment_status !== 'paid' && (
  <Link
    to={`/tenant/payment/${booking.id}`}
    className="btn-primary bg-green-600 hover:bg-green-700 px-3 py-1.5 text-sm font-bold"
  >
    💳 Pay Now
  </Link>
)}

{booking.payment_status === 'paid' && (
  <span className="px-3 py-1.5 text-sm font-bold bg-green-100 text-green-800 rounded-lg">
    ✓ Paid
  </span>
)}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default MyBookings;