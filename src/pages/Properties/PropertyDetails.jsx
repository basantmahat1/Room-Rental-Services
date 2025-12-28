import React, { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import Navbar from '../../components/Layout/Navbar';
import MapView from '../../components/Map/MapView';
import { propertyAPI, bookingAPI, wishlistAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { ShareAltOutlined ,MessageOutlined} from '@ant-design/icons';
import RoutingMap from '../../components/Map/RoutingMap';
const PropertyDetails = () => {
  const { id } = useParams();
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [inWishlist, setInWishlist] = useState(false);
  const [selectedImage, setSelectedImage] = useState(0);
  const [allImages, setAllImages] = useState([]);
   const [mapView, setMapView] = useState('simple'); // 'simple' or 'routing'
  
  const [bookingData, setBookingData] = useState({
    start_date: '',
    end_date: '',
    message: ''
  });

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      const response = await propertyAPI.getById(id);
      const propertyData = response.data.property;
      setProperty(propertyData);
      setInWishlist(propertyData.inWishlist);
      
      const processedImages = processImages(propertyData);
      setAllImages(processedImages);
      
    } catch (error) {
      console.error('Error loading property:', error);
      alert('Property not found');
      navigate('/');
    } finally {
      setLoading(false);
    }
  };

  const processImages = (propertyData) => {
    const images = [];

    if (propertyData.primary_image) {
      if (typeof propertyData.primary_image === "string" && propertyData.primary_image.trim() !== "") {
        images.push(propertyData.primary_image);
      } else if (typeof propertyData.primary_image === "object" && propertyData.primary_image !== null && propertyData.primary_image.url) {
        images.push(propertyData.primary_image.url);
      }
    }

    let imagesArray = propertyData.images;
    
    if (typeof imagesArray === 'string') {
      try {
        imagesArray = JSON.parse(imagesArray);
      } catch (e) {
        imagesArray = [];
      }
    }
    
    if (Array.isArray(imagesArray) && imagesArray.length > 0) {
      imagesArray.forEach((img) => {
        if (typeof img === "string" && img.trim() !== "") {
          images.push(img);
        } else if (typeof img === "object" && img !== null && img.url) {
          images.push(img.url);
        }
      });
    }

    const uniqueImages = [...new Set(images)];

    if (uniqueImages.length === 0) {
      return ["https://via.placeholder.com/1200x600/cccccc/969696?text=No+Property+Images"];
    }

    return uniqueImages;
  };

  const handleWishlistToggle = async () => {
    if (!isAuthenticated || user.role !== 'tenant') {
      alert('Please login as tenant to add to wishlist');
      navigate('/login');
      return;
    }

    try {
      if (inWishlist) {
        await wishlistAPI.remove(property.id);
        setInWishlist(false);
        alert('Removed from wishlist');
      } else {
        await wishlistAPI.add(property.id);
        setInWishlist(true);
        alert('Added to wishlist');
      }
    } catch (error) {
      alert(error.response?.data?.message || 'Error updating wishlist');
    }
  };

 const handleBooking = async (e) => {
  e.preventDefault();
  
  if (!isAuthenticated || user.role !== 'tenant') {
    alert('Please login as tenant to book');
    navigate('/login');
    return;
  }

  try {
    const response = await bookingAPI.create({
      property_id: property.id,
      ...bookingData
    });
    
    const bookingId = response.data.booking.id;
    
    alert('Booking request sent successfully!');
    setShowBookingModal(false);
    
    // 💳 Redirect to payment page instead of bookings
    navigate(`/tenant/payment/${bookingId}`);
  } catch (error) {
    alert(error.response?.data?.message || 'Booking failed');
  }
};

  const handleWhatsAppContact = () => {
    if (!property.owner_phone) {
      alert('Owner phone number not available');
      return;
    }
    
    const message = `Hi, I'm interested in your property: ${property.title}\nPrice: $${property.price}/month\nLocation: ${property.address}, ${property.city}\n\nView property: ${window.location.href}`;
    const phone = property.owner_phone.replace(/[^0-9]/g, '');
    window.open(`https://wa.me/${phone}?text=${encodeURIComponent(message)}`, '_blank');
  };

  const handleShare = () => {
    const shareUrl = window.location.href;
    const shareText = `Check out this ${property.property_type} in ${property.city} for $${property.price}/month`;
    
    if (navigator.share) {
      navigator.share({
        title: property.title,
        text: shareText,
        url: shareUrl
      }).catch(err => console.log('Share cancelled:', err));
    } else {
      navigator.clipboard.writeText(shareUrl)
        .then(() => alert('Link copied to clipboard!'))
        .catch(err => console.error('Copy failed:', err));
    }
  };

  const nextImage = () => {
    setSelectedImage((prev) => (prev + 1) % allImages.length);
  };

  const prevImage = () => {
    setSelectedImage((prev) => (prev - 1 + allImages.length) % allImages.length);
  };

  const today = new Date().toISOString().split('T')[0];

  if (loading) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--color-bg-light)'}}>
          <div className="text-center">
            <div className="spinner h-16 w-16 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading property details...</p>
          </div>
        </div>
      </>
    );
  }

  if (!property) {
    return (
      <>
        <Navbar />
        <div className="min-h-screen flex items-center justify-center" style={{backgroundColor: 'var(--color-bg-light)'}}>
          <div className="text-center">
            <h2 className="text-2xl font-bold mb-2" style={{color: 'var(--color-primary)'}}>Property Not Found</h2>
            <p className="text-gray-600 mb-4">The property you're looking for doesn't exist.</p>
            <button onClick={() => navigate('/')} className="btn-primary">
              Browse Properties
            </button>
          </div>
        </div>
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="min-h-screen" style={{backgroundColor: 'var(--color-bg-light)'}}>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <button
            onClick={() => navigate(-1)}
            className="mb-6 flex items-center gap-2 text-gray-600 hover:text-gray-900 transition-colors font-medium"
          >
            ← Back to Properties
          </button>

          {/* Two Column Layout */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Column 1: Images (2/3 width) */}
            <div className="lg:col-span-2 space-y-6">
              {/* Image Gallery */}
              <div className="card p-6">
                {allImages.length > 0 ? (
                  <>
                    {/* Main Image Container */}
                    <div className="relative mb-4 shadow-xl rounded-2xl overflow-hidden bg-gray-100 group">
                      <div className="aspect-[16/9] w-full overflow-hidden">
                        <img
                          key={selectedImage}
                          src={allImages[selectedImage]}
                          alt={property.title}
                          className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          onError={(e) => {
                            e.target.src = 'https://via.placeholder.com/1200x675/cccccc/969696?text=Image+Not+Available';
                            e.target.onerror = null;
                          }}
                        />
                        
                        {/* Image Navigation Overlays */}
                        {allImages.length > 1 && (
                          <>
                            <div className="absolute inset-y-0 left-0 flex items-center pl-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={prevImage} className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg text-teal-600 transition-transform hover:scale-110">
                                <span className="text-2xl">‹</span>
                              </button>
                            </div>
                            <div className="absolute inset-y-0 right-0 flex items-center pr-4 opacity-0 group-hover:opacity-100 transition-opacity">
                              <button onClick={nextImage} className="bg-white/90 hover:bg-white p-3 rounded-full shadow-lg text-teal-600 transition-transform hover:scale-110">
                                <span className="text-2xl">›</span>
                              </button>
                            </div>
                            <div className="absolute bottom-6 right-6 bg-black/60 backdrop-blur-md px-4 py-1.5 rounded-full text-white text-sm font-medium border border-white/20">
                              {selectedImage + 1} / {allImages.length}
                            </div>
                          </>
                        )}
                      </div>
                    </div>
                    
                    {/* Thumbnails - Scrollable if many */}
                    {allImages.length > 1 && (
                      <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                        {allImages.map((img, i) => (
                          <button
                            key={i}
                            onClick={() => setSelectedImage(i)}
                            className={`relative flex-shrink-0 w-32 h-20 overflow-hidden rounded-xl transition-all ${
                              selectedImage === i 
                              ? 'ring-2 ring-teal-500 ring-offset-2 scale-95' 
                              : 'opacity-70 hover:opacity-100'
                            }`}
                          >
                            <img
                              src={img}
                              alt={`View ${i + 1}`}
                              className="w-full h-full object-cover"
                            />
                          </button>
                        ))}
                      </div>
                    )}
                  </>
                ) : (
                  <div className="aspect-[16/9] bg-gray-50 border-2 border-dashed border-gray-200 rounded-2xl flex flex-col items-center justify-center">
                    <span className="text-5xl mb-2">🏠</span>
                    <p className="text-gray-400 font-medium">No images uploaded yet</p>
                  </div>
                )}
              </div>

              {/* Description */}
              <div className="card p-6">
                <h2 className="text-xl font-bold mb-4" style={{color: 'var(--color-primary)'}}>Description</h2>
                <div className="text-gray-700 whitespace-pre-line leading-relaxed">
                  {property.description || 'No description available.'}
                </div>
              </div>

              {/* Amenities */}
              {property.amenities && property.amenities.length > 0 && (
                <div className="card p-6">
                  <h2 className="text-xl font-bold mb-4" style={{color: 'var(--color-primary)'}}>✨ Amenities</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {Array.isArray(property.amenities) && property.amenities.map((amenity, index) => (
                      <div key={index} className="flex items-center gap-3 p-3 rounded-lg" style={{backgroundColor: 'var(--color-bg-light)'}}>
                        <span className="text-xl" style={{color: 'var(--color-success)'}}>✓</span>
                        <span className="text-gray-700 capitalize">{amenity.replace(/_/g, ' ')}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
  

            {/* Column 2: Property Details & Booking (1/3 width) */}
            <div className="space-y-6">
              {/* Title and Info */}
              <div className="card p-6">
                <h1 className="text-2xl font-bold mb-3" style={{color: 'var(--color-primary)'}}>{property.title}</h1>
                <div className="flex items-center gap-2 text-sm text-gray-600 mb-4">
                  <span>📍</span>
                  <span>{property.address}, {property.city}</span>
                </div>
                
                <div className="text-right mb-4">
                  <div className="price-tag">${property.price}</div>
                  <div className="text-sm text-gray-500">per month</div>
                </div>

                <div className="flex flex-wrap gap-2 mb-4">
                  {property.is_verified && (
                    <span className="badge-success text-xs">✓ Verified</span>
                  )}
                  {property.instant_booking && (
                    <span className="badge-info text-xs">⚡ Instant</span>
                  )}
                  {property.furnishing && (
                    <span className="badge-warning capitalize text-xs">{property.furnishing}</span>
                  )}
                  <span className="badge-info capitalize text-xs">{property.property_type}</span>
                </div>

                <div className="grid grid-cols-2 gap-3 p-4 rounded-lg" style={{backgroundColor: 'var(--color-bg-light)'}}>
                  <div className="text-center">
                    <div className="text-xl font-bold mb-1" style={{color: 'var(--color-primary)'}}>{property.bedrooms}</div>
                    <div className="text-xs text-gray-600">Bedrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold mb-1" style={{color: 'var(--color-primary)'}}>{property.bathrooms}</div>
                    <div className="text-xs text-gray-600">Bathrooms</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold mb-1" style={{color: 'var(--color-primary)'}}>{property.area_sqft}</div>
                    <div className="text-xs text-gray-600">Sq. Ft.</div>
                  </div>
                  <div className="text-center">
                    <div className="text-xl font-bold mb-1" style={{color: 'var(--color-primary)'}}>{property.view_count || 0}</div>
                    <div className="text-xs text-gray-600">Views</div>
                  </div>
                </div>
              </div>

              {/* Owner Info & Booking */}
                <div className="card p-6">
              <h3 className="font-bold text-lg mb-4" style={{color: 'var(--color-primary)'}}>👤 Property Owner</h3>
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 rounded-full flex items-center justify-center text-white text-lg font-bold"
                     style={{background: 'linear-gradient(135deg, var(--color-primary), var(--color-secondary))'}}>
                  {property.owner_name?.charAt(0).toUpperCase() || 'O'}
                </div>
                <div>
                  <div className="font-semibold">{property.owner_name || 'Owner'}</div>
                  {property.owner_verified && (
                    <div className="text-xs flex items-center gap-1" style={{color: 'var(--color-success)'}}>
                      <span>✓</span>
                      <span>Verified</span>
                    </div>
                  )}
                </div>
              </div>
              
              {/* 🔒 YO NAYA MESSAGE ADD GARNUS */}
              {isAuthenticated && user?.role === 'tenant' && (
                <div className="bg-blue-50 border border-blue-300 rounded-lg p-3 mb-4">
                  <div className="text-xs font-semibold text-blue-800 mb-1">📞 Contact Information</div>
                  <p className="text-xs text-blue-700">
                    Owner contact details will be available after payment verification
                  </p>
                </div>
              )}
              
              {/* 👇 PURANO EMAIL/PHONE SECTION REMOVE GARNUS YA CONDITIONAL BANAUNUS */}
              {/* Only show if payment is verified OR user is not a tenant */}
              {(!isAuthenticated || user?.role !== 'tenant') && (
                <>
                  {property.owner_email && (
                    <div className="mb-3">
                      <div className="text-xs text-gray-500">Email</div>
                      <div className="text-sm font-medium">{property.owner_email}</div>
                    </div>
                  )}
                  
                  {property.owner_phone && (
                    <div className="mb-4">
                      <div className="text-xs text-gray-500">Phone</div>
                      <div className="text-sm font-medium">{property.owner_phone}</div>
                    </div>
                  )}
                </>
              )}

              {/* Booking buttons */}
              <div className="space-y-2">
                {isAuthenticated && user?.role === 'tenant' ? (
                  <>
                    <button onClick={() => setShowBookingModal(true)} className="btn-primary w-full text-sm py-2.5">
                      {property.instant_booking ? '⚡ Book Instantly' : '📅 Request Booking'}
                    </button>
                    
                    <button
                      onClick={handleWishlistToggle}
                      className={`w-full py-2.5 rounded-lg text-sm font-semibold border-2 transition-all ${
                        inWishlist ? 'bg-red-50 border-red-500 text-red-600' : 'border-gray-300 text-gray-700 hover:border-gray-400'
                      }`}
                    >
                      {inWishlist ? '❤️ In Wishlist' : '🤍 Add to Wishlist'}
                    </button>
                  </>
                ) : !isAuthenticated ? (
                  <Link to="/login" className="btn-primary w-full block text-center text-sm py-2.5">
                    Login to Book
                  </Link>
                ) : (
                  <div className="text-center text-gray-600 py-2 text-sm">
                    Only tenants can book properties
                  </div>
                )}

                {/* WhatsApp button - only show if NOT tenant OR if payment verified */}
                {property.owner_phone && (!isAuthenticated || user?.role !== 'tenant') && (
                  <button onClick={handleWhatsAppContact} className="w-full bg-green-500 text-white py-2.5 rounded-lg text-sm font-semibold hover:bg-green-600 transition-colors">
                    <MessageOutlined/> WhatsApp
                  </button>
                )}

                <button onClick={handleShare} className="btn-outline w-full text-sm py-2.5">
                  <ShareAltOutlined/> Share
                </button>
              </div>
            </div>
              {/* Ratings */}
              {(property.avg_rating && property.avg_rating > 0) && (
                <div className="card p-6">
                  <h3 className="font-bold text-lg mb-4" style={{color: 'var(--color-primary)'}}>⭐ Ratings</h3>
                  <div className="text-center">
                    <div className="text-3xl font-bold mb-2" style={{color: 'var(--color-warning)'}}>
                      {property.avg_rating.toFixed(1)}
                    </div>
                    <div className="flex justify-center mb-2">
                      {[...Array(5)].map((_, i) => (
                        <span key={i} className={`text-xl ${i < Math.floor(property.avg_rating) ? 'text-yellow-400' : 'text-gray-300'}`}>
                          ★
                        </span>
                      ))}
                    </div>
                    <div className="text-xs text-gray-600">
                      {property.total_reviews || 0} review(s)
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Map Section */}
              {property.latitude && property.longitude && (
            <div className="card p-6 mt-8">
              {/* Header with View Toggle */}
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
                <div>
                  <h2 className="text-2xl font-bold mb-1" style={{color: 'var(--color-primary)'}}>
                    📍 Location & Navigation
                  </h2>
                  <div className="text-sm text-gray-600">
                    {parseFloat(property.latitude).toFixed(6)}, 
                    {parseFloat(property.longitude).toFixed(6)}
                  </div>
                </div>
                
                {/* View Toggle Buttons */}
                <div className="flex gap-2">
                  <button
                    onClick={() => setMapView('simple')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      mapView === 'simple'
                        ? 'bg-[var(--color-primary)] text-white shadow-md'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[var(--color-primary)]'
                    }`}
                  >
                    📍 View Location
                  </button>
                  <button
                    onClick={() => setMapView('routing')}
                    className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all ${
                      mapView === 'routing'
                        ? 'bg-[var(--color-primary)] text-white shadow-md'
                        : 'bg-white text-gray-700 border-2 border-gray-300 hover:border-[var(--color-primary)]'
                    }`}
                  >
                    🧭 Get Directions
                  </button>
                </div>
              </div>

              {/* Map Display */}
              <div className="mb-4">
                {mapView === 'simple' ? (
                  <MapView
                    latitude={property.latitude}
                    longitude={property.longitude}
                    propertyTitle={property.title}
                    address={`${property.address}, ${property.city}`}
                    height="500px"
                    showControls={true}
                  />
                ) : (
                  <RoutingMap
                    propertyLatitude={property.latitude}
                    propertyLongitude={property.longitude}
                    propertyTitle={property.title}
                    propertyAddress={`${property.address}, ${property.city}`}
                    height="600px"
                  />
                )}
              </div>

              {/* Instructions/Info Box */}
              <div className={`rounded-lg p-4 border-2 ${
                mapView === 'simple' 
                  ? 'bg-blue-50 border-blue-300' 
                  : 'bg-green-50 border-green-300'
              }`}>
                {mapView === 'simple' ? (
                  <div className="text-sm">
                    <div className="flex items-start gap-2 mb-2">
                      <span className="text-blue-600 font-bold">📍</span>
                      <div>
                        <strong className="text-blue-900">Viewing property location</strong>
                        <p className="text-blue-700 mt-1">
                          Click the marker for details. Use zoom controls to explore the area.
                        </p>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="text-sm">
                    <div className="flex items-start gap-2 mb-3">
                      <span className="text-green-600 font-bold text-xl">🧭</span>
                      <div>
                        <strong className="text-green-900 text-base">How to get directions:</strong>
                      </div>
                    </div>
                    <ol className="list-decimal ml-6 space-y-2 text-green-800">
                      <li>Click the <strong>"Get Directions"</strong> button on the map</li>
                      <li>Allow location access when your browser asks</li>
                      <li>Choose travel mode: 🚗 Drive, 🚶 Walk, or 🚴 Cycle</li>
                      <li>View route with distance & estimated time</li>
                      <li>Drag waypoints to adjust your route</li>
                    </ol>
                    <div className="mt-3 pt-3 border-t border-green-300">
                      <p className="text-green-700">
                        <strong>💡 Tip:</strong> The route will show alternative paths and 
                        real-time distance calculations.
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}
              {/* <MapView
                latitude={property.latitude}
                longitude={property.longitude}
                propertyTitle={property.title}
                address={`${property.address}, ${property.city}`}
                height="500px"
                showControls={true}
                showLegend={true}
              /> 
            </div>
          )}*/}
        </div>
      </div>

      {/* Booking Modal */}
      {showBookingModal && (
        <div className="modal-overlay">
          <div className="modal-content max-w-md">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold" style={{color: 'var(--color-primary)'}}>Book This Property</h2>
              <button onClick={() => setShowBookingModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>
            
            <div className="p-6 scrollable-form">
              <div className="p-4 rounded-lg mb-4" style={{backgroundColor: 'rgba(0, 191, 165, 0.1)'}}>
                <div className="font-semibold text-lg mb-1">{property.title}</div>
                <div className="price-tag">${property.price}/month</div>
                <div className="text-sm text-gray-600 mt-1">
                  {property.address}, {property.city}
                </div>
              </div>

              <div className="space-y-4">
                <div>
                  <label className="form-label">Move-in Date *</label>
                  <input
                    type="date"
                    required
                    min={today}
                    className="input-ui"
                    value={bookingData.start_date}
                    onChange={(e) => setBookingData({...bookingData, start_date: e.target.value})}
                  />
                </div>

                <div>
                  <label className="form-label">Expected End Date (Optional)</label>
                  <input
                    type="date"
                    min={bookingData.start_date || today}
                    className="input-ui"
                    value={bookingData.end_date}
                    onChange={(e) => setBookingData({...bookingData, end_date: e.target.value})}
                  />
                  <p className="text-xs text-gray-500 mt-1">Leave empty for long-term rental</p>
                </div>

                <div>
                  <label className="form-label">Message to Owner (Optional)</label>
                  <textarea
                    rows="4"
                    className="input-ui resize-none"
                    placeholder="Introduce yourself and tell the owner why you're interested..."
                    value={bookingData.message}
                    onChange={(e) => setBookingData({...bookingData, message: e.target.value})}
                  />
                </div>

                <div className="flex gap-3 pt-4">
                  <button
                    type="button"
                    onClick={() => setShowBookingModal(false)}
                    className="flex-1 btn-outline"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={handleBooking}
                    className="flex-1 btn-primary"
                  >
                    {property.instant_booking ? 'Confirm' : 'Send Request'}
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyDetails;