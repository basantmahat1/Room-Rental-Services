import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import BookingCalendar from '../components/BookingCalendar';

const PropertyDetails = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { user } = useAuth();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedDates, setSelectedDates] = useState([null, null]);

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await fetch(`/api/properties/${id}`);
      const data = await response.json();
      setProperty(data);
    } catch (error) {
      setError('Failed to load property details');
    } finally {
      setLoading(false);
    }
  };

  const handleBookNow = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    if (user.role !== 'tenant') {
      alert('Only tenants can book properties');
      return;
    }

    if (!selectedDates[0] || !selectedDates[1]) {
      alert('Please select check-in and check-out dates');
      return;
    }

    // Navigate to booking page
    navigate('/booking', {
      state: {
        propertyId: id,
        checkInDate: selectedDates[0],
        checkOutDate: selectedDates[1]
      }
    });
  };

  const handleInquiry = () => {
    if (!user) {
      navigate('/login');
      return;
    }

    const message = prompt('Enter your inquiry message:');
    if (message) {
      sendInquiry(message);
    }
  };

  const sendInquiry = async (message) => {
    try {
      const response = await fetch('/api/inquiries', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
        },
        body: JSON.stringify({
          property_id: id,
          message
        })
      });

      if (response.ok) {
        alert('Inquiry sent successfully!');
      }
    } catch (error) {
      alert('Failed to send inquiry');
    }
  };

  const handleShare = () => {
    const url = window.location.href;
    const text = `Check out this property: ${property?.title}`;
    
    if (navigator.share) {
      navigator.share({
        title: property?.title,
        text: text,
        url: url
      });
    } else {
      navigator.clipboard.writeText(url);
      alert('Link copied to clipboard!');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl">Loading property details...</div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="flex items-center justify-center h-screen">
        <div className="text-xl text-red-600">{error || 'Property not found'}</div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-4">
      {/* Breadcrumb */}
      <div className="text-sm text-gray-600 mb-4">
        <button onClick={() => navigate(-1)} className="hover:text-blue-600">
          ← Back to search
        </button>
      </div>

      {/* Property Header */}
      <div className="bg-white rounded-lg shadow-lg p-6 mb-6">
        <div className="flex flex-col lg:flex-row justify-between items-start lg:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">{property.title}</h1>
            <div className="flex items-center gap-2 mt-2">
              <span className="text-gray-600">📍 {property.address}</span>
              {property.verified && (
                <span className="bg-green-100 text-green-800 text-xs font-semibold px-2 py-1 rounded">
                  Verified
                </span>
              )}
              {property.featured && (
                <span className="bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded">
                  Featured
                </span>
              )}
            </div>
          </div>
          <div className="text-right">
            <div className="text-3xl font-bold text-green-600">
              ${property.price}<span className="text-lg text-gray-600">/month</span>
            </div>
            <div className="text-sm text-gray-600">+ utilities</div>
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Left Column - Images & Details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Property Images */}
          <div className="bg-white rounded-lg shadow-lg overflow-hidden">
            {property.images && property.images.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2 p-2">
                {property.images.map((img, index) => (
                  <img
                    key={img.id || index}
                    src={img.image_url}
                    alt={`Property ${index + 1}`}
                    className={`w-full h-64 object-cover rounded-lg ${
                      index === 0 ? 'md:col-span-2 h-96' : 'h-64'
                    }`}
                  />
                ))}
              </div>
            ) : (
              <div className="h-96 bg-gray-100 flex items-center justify-center">
                <span className="text-gray-400">No images available</span>
              </div>
            )}
          </div>

          {/* Tabs */}
          <div className="bg-white rounded-lg shadow-lg">
            <div className="border-b border-gray-200">
              <nav className="flex -mb-px">
                {['overview', 'amenities', 'reviews', 'location'].map((tab) => (
                  <button
                    key={tab}
                    onClick={() => setActiveTab(tab)}
                    className={`py-4 px-6 text-sm font-medium ${
                      activeTab === tab
                        ? 'border-b-2 border-blue-500 text-blue-600'
                        : 'text-gray-500 hover:text-gray-700 hover:border-gray-300'
                    }`}
                  >
                    {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  </button>
                ))}
              </nav>
            </div>

            <div className="p-6">
              {activeTab === 'overview' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Description</h3>
                  <p className="text-gray-700 whitespace-pre-line">
                    {property.description}
                  </p>
                  
                  <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-6">
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl">🛏️</div>
                      <div className="font-semibold">{property.bedrooms}</div>
                      <div className="text-sm text-gray-600">Bedrooms</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl">🚿</div>
                      <div className="font-semibold">{property.bathrooms}</div>
                      <div className="text-sm text-gray-600">Bathrooms</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl">📏</div>
                      <div className="font-semibold">{property.area_sqft} sqft</div>
                      <div className="text-sm text-gray-600">Area</div>
                    </div>
                    <div className="text-center p-4 bg-gray-50 rounded-lg">
                      <div className="text-2xl">🏢</div>
                      <div className="font-semibold capitalize">{property.property_type}</div>
                      <div className="text-sm text-gray-600">Type</div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'amenities' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Amenities</h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {property.amenities && property.amenities.map((amenity, index) => {
                      const icons = {
                        wifi: { icon: '📶', label: 'WiFi' },
                        parking: { icon: '🅿️', label: 'Parking' },
                        water: { icon: '💧', label: 'Water Supply' },
                        kitchen: { icon: '🍳', label: 'Kitchen' },
                        ac: { icon: '❄️', label: 'Air Conditioning' },
                        laundry: { icon: '👕', label: 'Laundry' },
                        security: { icon: '🔒', label: 'Security' },
                        pool: { icon: '🏊', label: 'Swimming Pool' },
                        gym: { icon: '💪', label: 'Gym' },
                        elevator: { icon: '🛗', label: 'Elevator' }
                      };
                      
                      const amenityInfo = icons[amenity] || { icon: '✓', label: amenity };
                      
                      return (
                        <div key={index} className="flex items-center gap-3 p-3 bg-gray-50 rounded-lg">
                          <span className="text-xl">{amenityInfo.icon}</span>
                          <span className="font-medium">{amenityInfo.label}</span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {activeTab === 'reviews' && (
                <div>
                  <div className="flex items-center justify-between mb-6">
                    <div>
                      <h3 className="text-lg font-semibold">Reviews</h3>
                      {property.ratingStats && (
                        <div className="flex items-center gap-2 mt-1">
                          <div className="flex">
                            {[...Array(5)].map((_, i) => (
                              <span
                                key={i}
                                className={`text-xl ${
                                  i < Math.floor(property.ratingStats.average_rating || 0)
                                    ? 'text-yellow-400'
                                    : 'text-gray-300'
                                }`}
                              >
                                ★
                              </span>
                            ))}
                          </div>
                          <span className="text-gray-600">
                            {property.ratingStats.average_rating?.toFixed(1) || '0.0'} 
                            ({property.ratingStats.total_reviews || 0} reviews)
                          </span>
                        </div>
                      )}
                    </div>
                    
                    {user && user.role === 'tenant' && (
                      <button
                        onClick={() => alert('Review functionality coming soon!')}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Write a Review
                      </button>
                    )}
                  </div>

                  {property.reviews && property.reviews.length > 0 ? (
                    <div className="space-y-4">
                      {property.reviews.map((review) => (
                        <div key={review.id} className="border-b border-gray-200 pb-4">
                          <div className="flex items-center justify-between mb-2">
                            <div className="flex items-center gap-2">
                              <div className="w-10 h-10 bg-gray-200 rounded-full flex items-center justify-center">
                                {review.user_name?.charAt(0) || 'U'}
                              </div>
                              <div>
                                <div className="font-medium">{review.user_name}</div>
                                <div className="text-sm text-gray-500">
                                  {new Date(review.created_at).toLocaleDateString()}
                                </div>
                              </div>
                            </div>
                            <div className="flex">
                              {[...Array(5)].map((_, i) => (
                                <span
                                  key={i}
                                  className={`${
                                    i < review.rating ? 'text-yellow-400' : 'text-gray-300'
                                  }`}
                                >
                                  ★
                                </span>
                              ))}
                            </div>
                          </div>
                          <p className="text-gray-700">{review.comment}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-500">
                      No reviews yet. Be the first to review this property!
                    </div>
                  )}
                </div>
              )}

              {activeTab === 'location' && (
                <div>
                  <h3 className="text-lg font-semibold mb-4">Location</h3>
                  <p className="text-gray-700 mb-4">{property.address}</p>
                  
                  {/* Map Placeholder */}
                  <div className="h-64 bg-gray-100 rounded-lg flex items-center justify-center">
                    <div className="text-center">
                      <div className="text-3xl mb-2">🗺️</div>
                      <div className="text-gray-600">Interactive map will be displayed here</div>
                      <div className="text-sm text-gray-500 mt-1">
                        (Google Maps integration)
                      </div>
                    </div>
                  </div>
                  
                  {/* Nearby Places */}
                  <div className="mt-6">
                    <h4 className="font-semibold mb-3">Nearby Places</h4>
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
                      {['Schools', 'Hospitals', 'Supermarkets', 'Restaurants', 'Parks', 'Banks'].map((place) => (
                        <div key={place} className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
                          <span className="text-lg">
                            {place === 'Schools' ? '🏫' :
                             place === 'Hospitals' ? '🏥' :
                             place === 'Supermarkets' ? '🛒' :
                             place === 'Restaurants' ? '🍽️' :
                             place === 'Parks' ? '🌳' : '🏦'}
                          </span>
                          <span>{place}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column - Booking & Actions */}
        <div className="space-y-6">
          {/* Booking Calendar */}
          <BookingCalendar
            propertyId={id}
            onDateSelect={setSelectedDates}
          />

          {/* Owner Information */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Property Owner</h3>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                {property.owner_name?.charAt(0) || 'O'}
              </div>
              <div>
                <div className="font-medium">{property.owner_name}</div>
                <div className="text-sm text-gray-600">Property Owner</div>
              </div>
            </div>
            
            <div className="space-y-3">
              <button
                onClick={handleInquiry}
                className="w-full py-3 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700"
              >
                📩 Send Inquiry
              </button>
              
              <button
                onClick={handleBookNow}
                disabled={!selectedDates[0] || !selectedDates[1]}
                className={`w-full py-3 rounded-lg font-medium ${
                  selectedDates[0] && selectedDates[1]
                    ? 'bg-green-600 text-white hover:bg-green-700'
                    : 'bg-gray-100 text-gray-400 cursor-not-allowed'
                }`}
              >
                {property.instant_booking ? '⚡ Instant Book Now' : '📅 Request to Book'}
              </button>
              
              <div className="flex gap-2">
                <button
                  onClick={handleShare}
                  className="flex-1 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                >
                  🔗 Share
                </button>
                {user && user.role === 'tenant' && (
                  <button
                    onClick={() => alert('Wishlist functionality coming soon!')}
                    className="flex-1 py-2 bg-red-100 text-red-600 rounded-lg hover:bg-red-200"
                  >
                    ❤️ Save
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Property Stats */}
          <div className="bg-white rounded-lg shadow-lg p-6">
            <h3 className="text-lg font-semibold mb-4">Property Stats</h3>
            <div className="space-y-3">
              <div className="flex justify-between">
                <span className="text-gray-600">Views</span>
                <span className="font-medium">{property.view_count || 0}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Booked</span>
                <span className="font-medium">{property.booked_count || 0} times</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Response Rate</span>
                <span className="font-medium text-green-600">98%</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Response Time</span>
                <span className="font-medium">Within 2 hours</span>
              </div>
            </div>
          </div>

          {/* Safety Tips */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h4 className="font-semibold text-blue-800 mb-2">⚠️ Safety Tips</h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>• Never wire money to someone you haven't met</li>
              <li>• Always meet in a public place</li>
              <li>• Verify the property ownership</li>
              <li>• Use secure payment methods</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyDetails;