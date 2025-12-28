import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';

const BookingManagement = () => {
  const { user } = useAuth();
  const [bookings, setBookings] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('upcoming');
  const [selectedBooking, setSelectedBooking] = useState(null);

  useEffect(() => {
    fetchBookings();
  }, [activeTab]);

  const fetchBookings = async () => {
    try {
      const response = await fetch('/api/bookings/user', {
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        }
      });
      const data = await response.json();
      
      // Filter bookings based on active tab
      const now = new Date();
      const filteredBookings = (data.bookings || []).filter(booking => {
        const checkInDate = new Date(booking.check_in_date);
        
        if (activeTab === 'upcoming') {
          return checkInDate >= now && booking.status === 'confirmed';
        } else if (activeTab === 'past') {
          return checkInDate < now;
        } else if (activeTab === 'pending') {
          return booking.status === 'pending';
        } else if (activeTab === 'cancelled') {
          return booking.status === 'cancelled';
        }
        return true;
      });
      
      setBookings(filteredBookings);
    } catch (error) {
      console.error('Error fetching bookings:', error);
    } finally {
      setLoading(false);
    }
  };

  const updateBookingStatus = async (bookingId, status) => {
    try {
      const response = await fetch(`/api/bookings/${bookingId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({ status })
      });

      if (response.ok) {
        fetchBookings();
        alert(`Booking ${status} successfully`);
      }
    } catch (error) {
      console.error('Error updating booking:', error);
      alert('Failed to update booking');
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-100 text-yellow-800',
      confirmed: 'bg-green-100 text-green-800',
      cancelled: 'bg-red-100 text-red-800',
      completed: 'bg-blue-100 text-blue-800'
    };
    return colors[status] || 'bg-gray-100 text-gray-800';
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      weekday: 'short',
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!user) {
    return (
      <div className="p-6">
        <h1 className="text-2xl font-bold text-red-600">Access Denied</h1>
        <p>Please login to view bookings.</p>
      </div>
    );
  }

  return (
    <div className="p-6">
      <h1 className="text-3xl font-bold mb-6">
        {user.role === 'owner' ? 'Booking Requests' : 'My Bookings'}
      </h1>

      {/* Tabs */}
      <div className="bg-white rounded-lg shadow mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex -mb-px">
            {[
              { id: 'upcoming', label: 'Upcoming' },
              { id: 'pending', label: 'Pending' },
              { id: 'past', label: 'Past' },
              { id: 'cancelled', label: 'Cancelled' }
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`py-4 px-6 text-sm font-medium ${
                  activeTab === tab.id
                    ? 'border-b-2 border-blue-500 text-blue-600'
                    : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            ))}
          </nav>
        </div>
      </div>

      {/* Bookings List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-8 text-center">
            <div className="text-lg">Loading bookings...</div>
          </div>
        ) : bookings.length === 0 ? (
          <div className="p-8 text-center">
            <div className="text-4xl mb-4">
              {activeTab === 'upcoming' ? '📅' :
               activeTab === 'pending' ? '⏳' :
               activeTab === 'past' ? '📖' : '❌'}
            </div>
            <h3 className="text-xl font-bold mb-2">
              {activeTab === 'upcoming' ? 'No upcoming bookings' :
               activeTab === 'pending' ? 'No pending requests' :
               activeTab === 'past' ? 'No past bookings' : 'No cancelled bookings'}
            </h3>
            <p className="text-gray-600">
              {activeTab === 'upcoming' ? 'Start by booking a property!' :
               activeTab === 'pending' ? 'All booking requests have been processed' :
               activeTab === 'past' ? 'You haven\'t completed any bookings yet' : 'No cancelled bookings found'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Property
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Dates
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    {user.role === 'owner' ? 'Tenant' : 'Owner'}
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Amount
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {bookings.map((booking) => (
                  <tr key={booking.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="flex items-center">
                        {booking.property_image && (
                          <div className="flex-shrink-0 h-10 w-10">
                            <img
                              src={booking.property_image}
                              alt={booking.title}
                              className="h-10 w-10 rounded object-cover"
                            />
                          </div>
                        )}
                        <div className="ml-4">
                          <div className="text-sm font-medium text-gray-900">
                            {booking.title}
                          </div>
                          <div className="text-sm text-gray-500 truncate max-w-xs">
                            {booking.address}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {formatDate(booking.check_in_date)}
                      </div>
                      <div className="text-sm text-gray-500">to</div>
                      <div className="text-sm text-gray-900">
                        {formatDate(booking.check_out_date)}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        {user.role === 'owner' ? booking.tenant_name : booking.owner_name}
                      </div>
                      <div className="text-sm text-gray-500">
                        {user.role === 'owner' ? 'Tenant' : 'Owner'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-semibold text-green-600">
                        ${booking.total_amount}
                      </div>
                      <div className="text-xs text-gray-500">
                        {booking.payment_status === 'paid' ? 'Paid' : 'Pending'}
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${getStatusColor(booking.status)}`}>
                        {booking.status}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                      <div className="flex gap-2">
                        <button
                          onClick={() => setSelectedBooking(booking)}
                          className="text-blue-600 hover:text-blue-900"
                        >
                          View
                        </button>
                        
                        {user.role === 'owner' && booking.status === 'pending' && (
                          <>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'confirmed')}
                              className="text-green-600 hover:text-green-900"
                            >
                              Accept
                            </button>
                            <button
                              onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                              className="text-red-600 hover:text-red-900"
                            >
                              Reject
                            </button>
                          </>
                        )}
                        
                        {user.role === 'tenant' && booking.status === 'pending' && (
                          <button
                            onClick={() => updateBookingStatus(booking.id, 'cancelled')}
                            className="text-red-600 hover:text-red-900"
                          >
                            Cancel
                          </button>
                        )}
                        
                        {booking.status === 'confirmed' && (
                          <button
                            onClick={() => alert('Contact details will be shared soon')}
                            className="text-purple-600 hover:text-purple-900"
                          >
                            Contact
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Booking Details Modal */}
      {selectedBooking && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
            <div className="p-6">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-xl font-bold">Booking Details</h2>
                <button
                  onClick={() => setSelectedBooking(null)}
                  className="text-gray-500 hover:text-gray-700"
                >
                  ✕
                </button>
              </div>
              
              <div className="space-y-6">
                {/* Property Info */}
                <div className="flex items-start gap-4">
                  {selectedBooking.property_image && (
                    <img
                      src={selectedBooking.property_image}
                      alt={selectedBooking.title}
                      className="w-32 h-24 object-cover rounded-lg"
                    />
                  )}
                  <div>
                    <h3 className="text-lg font-semibold">{selectedBooking.title}</h3>
                    <p className="text-gray-600">{selectedBooking.address}</p>
                    <p className="text-green-600 font-bold mt-1">
                      ${selectedBooking.total_amount}
                    </p>
                  </div>
                </div>

                {/* Booking Details */}
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Check-in Date
                    </label>
                    <div className="mt-1 font-medium">
                      {formatDate(selectedBooking.check_in_date)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Check-out Date
                    </label>
                    <div className="mt-1 font-medium">
                      {formatDate(selectedBooking.check_out_date)}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Booking ID
                    </label>
                    <div className="mt-1 font-mono text-sm">
                      #{selectedBooking.id}
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700">
                      Status
                    </label>
                    <div className="mt-1">
                      <span className={`px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(selectedBooking.status)}`}>
                        {selectedBooking.status}
                      </span>
                    </div>
                  </div>
                </div>

                {/* Contact Information */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold mb-3">Contact Information</h4>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        {user.role === 'owner' ? 'Tenant' : 'Owner'} Name
                      </label>
                      <div className="mt-1">
                        {user.role === 'owner' ? selectedBooking.tenant_name : selectedBooking.owner_name}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Email
                      </label>
                      <div className="mt-1">
                        {selectedBooking.email || 'contact@example.com'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Phone
                      </label>
                      <div className="mt-1">
                        {selectedBooking.phone || '+1 (555) 123-4567'}
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700">
                        Booked On
                      </label>
                      <div className="mt-1">
                        {formatDate(selectedBooking.created_at)}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="border-t border-gray-200 pt-4">
                  <h4 className="font-semibold mb-3">Actions</h4>
                  <div className="flex gap-3">
                    {user.role === 'owner' && selectedBooking.status === 'pending' && (
                      <>
                        <button
                          onClick={() => {
                            updateBookingStatus(selectedBooking.id, 'confirmed');
                            setSelectedBooking(null);
                          }}
                          className="flex-1 bg-green-600 text-white py-2 px-4 rounded-md hover:bg-green-700"
                        >
                          Accept Booking
                        </button>
                        <button
                          onClick={() => {
                            updateBookingStatus(selectedBooking.id, 'cancelled');
                            setSelectedBooking(null);
                          }}
                          className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                        >
                          Reject Booking
                        </button>
                      </>
                    )}
                    
                    {user.role === 'tenant' && selectedBooking.status === 'pending' && (
                      <button
                        onClick={() => {
                          updateBookingStatus(selectedBooking.id, 'cancelled');
                          setSelectedBooking(null);
                        }}
                        className="flex-1 bg-red-600 text-white py-2 px-4 rounded-md hover:bg-red-700"
                      >
                        Cancel Booking
                      </button>
                    )}
                    
                    <button
                      onClick={() => alert('Message functionality coming soon!')}
                      className="flex-1 bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700"
                    >
                      Send Message
                    </button>
                    
                    <button
                      onClick={() => window.print()}
                      className="flex-1 bg-gray-600 text-white py-2 px-4 rounded-md hover:bg-gray-700"
                    >
                      Print Receipt
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BookingManagement;