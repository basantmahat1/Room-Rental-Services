import React, { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { propertyAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import MapModal from '../../components/Map/MapModal';

const PropertyForm = ({ property = null, onSuccess }) => {
  const navigate = useNavigate();
  const { id } = useParams();
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [geocoding, setGeocoding] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [images, setImages] = useState([]);
  const [previewUrls, setPreviewUrls] = useState([]);
  const [existingImages, setExistingImages] = useState([]);
  const [showMapModal, setShowMapModal] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(null);

  const nepaliCities = [
    'Kathmandu', 'Pokhara', 'Butwal', 'Biratnagar', 'Bharatpur',
    'Hetauda', 'Dharan', 'Damak', 'Nepalgunj', 'Bhairahawa',
    'Janakpur', 'Birgunj', 'Dhankuta', 'Ilam', 'Lalitpur',
    'Bhaktapur', 'Kirtipur', 'Madhyapur Thimi', 'Tansen', 'Baglung'
  ];

  const propertyTypes = [
    { value: 'room', label: '🚪 Room', desc: 'Single room for rent' },
    { value: 'flat', label: '🏢 Flat/Apartment', desc: 'Complete flat' },
    { value: 'house', label: '🏠 House', desc: 'Independent house' },
    { value: 'studio', label: '🏡 Studio', desc: 'Studio apartment' },
    { value: 'commercial', label: '🏬 Commercial', desc: 'Office/Shop space' }
  ];

  const furnishingOptions = [
    { value: 'furnished', label: 'Fully Furnished', desc: 'All furniture included' },
    { value: 'semi_furnished', label: 'Semi-Furnished', desc: 'Basic furniture' },
    { value: 'unfurnished', label: 'Unfurnished', desc: 'No furniture' }
  ];

  const amenitiesList = [
    { id: 'wifi', label: 'WiFi', icon: '📶' },
    { id: 'parking', label: 'Parking', icon: '🅿️' },
    { id: 'water', label: 'Water Supply', icon: '💧' },
    { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
    { id: 'ac', label: 'Air Conditioning', icon: '❄️' },
    { id: 'laundry', label: 'Laundry', icon: '🧺' },
    { id: 'security', label: '24/7 Security', icon: '🔒' },
    { id: 'pool', label: 'Swimming Pool', icon: '🏊' },
    { id: 'gym', label: 'Gym', icon: '💪' },
    { id: 'elevator', label: 'Elevator', icon: '🛗' },
    { id: 'tv', label: 'TV/Cable', icon: '📺' },
    { id: 'heating', label: 'Heating', icon: '🔥' },
    { id: 'balcony', label: 'Balcony', icon: '🪴' },
    { id: 'garden', label: 'Garden', icon: '🌳' },
    { id: 'pet_friendly', label: 'Pet Friendly', icon: '🐾' }
  ];

  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'room',
    price: '',
    address: '',
    city: '',
    state: '',
    country: 'Nepal',
    postal_code: '',
    bedrooms: '1',
    bathrooms: '1',
    area_sqft: '',
    furnishing: 'unfurnished',
    amenities: [],
    latitude: '',
    longitude: '',
    is_available: true,
    instant_booking: false
  });

  // Load property data if editing
  useEffect(() => {
    if (id) {
      loadProperty();
    } else if (property) {
      populateForm(property);
    }
  }, [id, property]);

  const loadProperty = async () => {
    try {
      const response = await propertyAPI.getById(id);
      populateForm(response.data.property);
    } catch (error) {
      setError('Failed to load property');
      console.error(error);
    }
  };

  const populateForm = (propertyData) => {
    setFormData({
      title: propertyData.title || '',
      description: propertyData.description || '',
      property_type: propertyData.property_type || 'room',
      price: propertyData.price || '',
      address: propertyData.address || '',
      city: propertyData.city || '',
      state: propertyData.state || '',
      country: propertyData.country || 'Nepal',
      postal_code: propertyData.postal_code || '',
      bedrooms: propertyData.bedrooms?.toString() || '1',
      bathrooms: propertyData.bathrooms?.toString() || '1',
      area_sqft: propertyData.area_sqft || '',
      furnishing: propertyData.furnishing || 'unfurnished',
      amenities: propertyData.amenities || [],
      latitude: propertyData.latitude || '',
      longitude: propertyData.longitude || '',
      is_available: propertyData.is_available ?? true,
      instant_booking: propertyData.instant_booking ?? false
    });

    if (propertyData.latitude && propertyData.longitude) {
      setSelectedLocation({
        lat: parseFloat(propertyData.latitude),
        lng: parseFloat(propertyData.longitude)
      });
    }

    if (propertyData.images && propertyData.images.length > 0) {
      setExistingImages(propertyData.images);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const toggleAmenity = (amenityId) => {
    setFormData(prev => {
      const currentAmenities = [...prev.amenities];
      const index = currentAmenities.indexOf(amenityId);
      if (index > -1) {
        currentAmenities.splice(index, 1);
      } else {
        currentAmenities.push(amenityId);
      }
      return { ...prev, amenities: currentAmenities };
    });
  };

  const handleMapLocationSelect = (locationData) => {
    setFormData(prev => ({
      ...prev,
      ...locationData
    }));
    
    if (locationData.latitude && locationData.longitude) {
      setSelectedLocation({
        lat: parseFloat(locationData.latitude),
        lng: parseFloat(locationData.longitude)
      });
    }
    
    if (locationData.address || locationData.city) {
      setSuccess('📍 Location and address updated from map!');
    }
  };

  const useCurrentLocation = () => {
    if (navigator.geolocation) {
      setGeocoding(true);
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const location = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };

          setFormData(prev => ({
            ...prev,
            latitude: location.lat.toString(),
            longitude: location.lng.toString()
          }));
          setSelectedLocation(location);

          setSuccess('📍 Current location detected!');
          setGeocoding(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          setError('Unable to get current location. Please allow location access.');
          setGeocoding(false);
        }
      );
    } else {
      setError('Geolocation is not supported by your browser');
    }
  };

  const handleManualGeocode = async () => {
    if (!formData.city) {
      setError('Please enter city first');
      return;
    }

    setGeocoding(true);
    setError('');

    try {
      const searchAddress = `${formData.city}, Nepal`;
      const response = await fetch(
        `http://localhost:5000/api/maps/geocode?address=${encodeURIComponent(searchAddress)}`
      );

      const data = await response.json();

      if (data.success && data.location) {
        setFormData(prev => ({
          ...prev,
          latitude: data.location.lat,
          longitude: data.location.lng,
          city: data.city || prev.city
        }));

        setSelectedLocation({
          lat: data.location.lat,
          lng: data.location.lng
        });

        setSuccess(`✓ Location found: ${data.city} (via ${data.provider})`);
      } else {
        setError(`⚠ ${data.message || 'Location not found'}`);
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      setError('Network error. Please check backend server.');
    } finally {
      setGeocoding(false);
    }
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    const newImages = [...images];
    const newPreviewUrls = [...previewUrls];

    files.forEach(file => {
      if (file.size > 5 * 1024 * 1024) {
        setError('File size must be less than 5MB');
        return;
      }

      if (!file.type.startsWith('image/')) {
        setError('Only image files are allowed');
        return;
      }

      newImages.push(file);

      const reader = new FileReader();
      reader.onload = (e) => {
        newPreviewUrls.push(e.target.result);
        setPreviewUrls([...newPreviewUrls]);
      };
      reader.readAsDataURL(file);
    });

    setImages(newImages);
  };

  const removeImage = (index) => {
    const newImages = [...images];
    const newPreviewUrls = [...previewUrls];
    newImages.splice(index, 1);
    newPreviewUrls.splice(index, 1);
    setImages(newImages);
    setPreviewUrls(newPreviewUrls);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setSuccess('');
    setLoading(true);

    try {
      if (!formData.title || !formData.description || !formData.price) {
        throw new Error('Please fill all required fields');
      }

      if (!formData.latitude || !formData.longitude) {
        if (formData.city) {
          try {
            const address = `${formData.city}, Nepal`;
            const response = await fetch(
              `http://localhost:5000/api/maps/geocode?address=${encodeURIComponent(address)}`
            );
            const data = await response.json();

            if (data.success && data.location) {
              formData.latitude = data.location.lat;
              formData.longitude = data.location.lng;
            } else {
              formData.latitude = 27.7172;
              formData.longitude = 85.3240;
            }
          } catch (geoError) {
            formData.latitude = 27.7172;
            formData.longitude = 85.3240;
          }
        } else {
          formData.latitude = 27.7172;
          formData.longitude = 85.3240;
        }
      }

      const formDataToSend = new FormData();
      Object.keys(formData).forEach(key => {
        if (key === 'is_available' || key === 'instant_booking') {
          formDataToSend.append(key, formData[key] ? 1 : 0);
        } else if (key === 'amenities') {
          formDataToSend.append(key, formData[key].join(','));
        } else {
          formDataToSend.append(key, formData[key]);
        }
      });

      if (!id) {
        images.forEach(image => formDataToSend.append('images', image));
      } else {
        if (existingImages.length > 0) {
          formDataToSend.append('existing_images', JSON.stringify(existingImages));
        }
        images.forEach(image => formDataToSend.append('images', image));
      }

      let response;
      if (id) {
        response = await propertyAPI.update(id, formDataToSend);
      } else {
        response = await propertyAPI.create(formDataToSend);
      }

      setSuccess(id ? 'Property updated successfully!' : 'Property added successfully!');

      setTimeout(() => {
        if (onSuccess) {
          onSuccess(response.data);
        } else {
          navigate('/owner/properties');
        }
      }, 1500);
    } catch (error) {
      console.error('Submission error:', error);
      setError(error.response?.data?.message || error.message || 'Something went wrong');
      window.scrollTo({ top: 0, behavior: 'smooth' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[var(--color-bg-light)] p-6">
      <div className="max-w-6xl mx-auto">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-[var(--color-primary)] mb-3">
            {id ? '✏️ Edit Property' : '➕ Add New Property'}
          </h1>
          <p className="text-gray-700 text-lg">
            Fill in the details below to {id ? 'update' : 'list'} your property
          </p>
        </div>

        {/* Error Message */}
        {error && (
          <div className="alert-error mb-6">
            <span className="text-2xl">⚠</span>
            <div>
              <div className="font-semibold mb-1">Error</div>
              <div>{error}</div>
            </div>
          </div>
        )}

        {/* Success Message */}
        {success && (
          <div className="alert-success mb-6">
            <span className="text-2xl">✓</span>
            <div>
              <div className="font-semibold mb-1">Success</div>
              <div>{success}</div>
            </div>
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="scrollable-form space-y-6">
            {/* Basic Information Section */}
            <div className="form-section">
              <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6 flex items-center gap-2">
                📋 Basic Information
              </h2>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Title */}
                <div className="md:col-span-2">
                  <label className="form-label">Property Title *</label>
                  <input
                    type="text"
                    name="title"
                    required
                    className="input-ui"
                    placeholder="e.g., Beautiful 2 BHK Apartment in Butwal"
                    value={formData.title}
                    onChange={handleChange}
                  />
                </div>

                {/* Property Type */}
                <div className="md:col-span-2">
                  <label className="form-label">Property Type *</label>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
                    {propertyTypes.map(type => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => setFormData({...formData, property_type: type.value})}
                        className={
                          formData.property_type === type.value
                            ? 'property-type-btn-active'
                            : 'property-type-btn'
                        }
                      >
                        <div className="text-3xl mb-2">{type.label.split(' ')[0]}</div>
                        <div className="font-semibold text-sm">{type.label.split(' ').slice(1).join(' ')}</div>
                        <div className="text-xs text-gray-600 mt-1">{type.desc}</div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Price */}
                <div>
                  <label className="form-label">Monthly Rent (₨) *</label>
                  <div className="relative">
                    <input
                      type="number"
                      name="price"
                      required
                      className="input-ui pl-12"
                      placeholder="5000"
                      value={formData.price}
                      onChange={handleChange}
                    />
                    <div className="absolute left-4 top-4 text-gray-500 font-semibold">₨</div>
                  </div>
                </div>

                {/* Area */}
                <div>
                  <label className="form-label">Area (sq ft) *</label>
                  <input
                    type="number"
                    name="area_sqft"
                    required
                    min="0"
                    className="input-ui"
                    placeholder="800"
                    value={formData.area_sqft}
                    onChange={handleChange}
                  />
                </div>

                {/* Bedrooms */}
                <div>
                  <label className="form-label">Bedrooms *</label>
                  <select
                    name="bedrooms"
                    required
                    className="input-ui"
                    value={formData.bedrooms}
                    onChange={handleChange}
                  >
                    <option value="1">1 Bedroom</option>
                    <option value="2">2 Bedrooms</option>
                    <option value="3">3 Bedrooms</option>
                    <option value="4">4 Bedrooms</option>
                    <option value="5">5+ Bedrooms</option>
                  </select>
                </div>

                {/* Bathrooms */}
                <div>
                  <label className="form-label">Bathrooms *</label>
                  <select
                    name="bathrooms"
                    required
                    className="input-ui"
                    value={formData.bathrooms}
                    onChange={handleChange}
                  >
                    <option value="1">1 Bathroom</option>
                    <option value="2">2 Bathrooms</option>
                    <option value="3">3 Bathrooms</option>
                    <option value="4">4+ Bathrooms</option>
                  </select>
                </div>
              </div>

              {/* Description */}
              <div className="mt-6">
                <label className="form-label">Description *</label>
                <textarea
                  name="description"
                  required
                  rows="5"
                  className="input-ui"
                  placeholder="Describe your property in detail..."
                  value={formData.description}
                  onChange={handleChange}
                />
              </div>
            </div>

            {/* Location Section */}
            <div className="form-section">
              <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6 flex items-center gap-2">
                📍 Location & Address
              </h2>
              
              <div className="space-y-6">
                <div>
                  <label className="form-label">Street Address / Area *</label>
                  <input
                    type="text"
                    name="address"
                    required
                    className="input-ui"
                    placeholder="e.g., Devinagar, Janasewa Path"
                    value={formData.address}
                    onChange={handleChange}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* City */}
                  <div>
                    <label className="form-label">City *</label>
                    <div className="relative">
                      <input
                        type="text"
                        name="city"
                        required
                        list="nepali-cities"
                        className="input-ui"
                        placeholder="Select or type city"
                        value={formData.city}
                        onChange={handleChange}
                      />
                      <datalist id="nepali-cities">
                        {nepaliCities.map(city => (
                          <option key={city} value={city} />
                        ))}
                      </datalist>
                    </div>
                  </div>

                  {/* State/Province */}
                  <div>
                    <label className="form-label">Province</label>
                    <select
                      name="state"
                      className="input-ui"
                      value={formData.state}
                      onChange={handleChange}
                    >
                      <option value="">Select Province</option>
                      <option value="Koshi Province">Koshi Province</option>
                      <option value="Madhesh Province">Madhesh Province</option>
                      <option value="Bagmati Province">Bagmati Province</option>
                      <option value="Gandaki Province">Gandaki Province</option>
                      <option value="Lumbini Province">Lumbini Province</option>
                      <option value="Karnali Province">Karnali Province</option>
                      <option value="Sudurpashchim Province">Sudurpashchim Province</option>
                    </select>
                  </div>

                  {/* Country */}
                  <div>
                    <label className="form-label">Country *</label>
                    <input
                      type="text"
                      name="country"
                      required
                      className="input-ui bg-gray-100"
                      value={formData.country}
                      onChange={handleChange}
                      readOnly
                    />
                  </div>
                </div>

                {/* Location Selection Methods */}
                <div className="space-y-4">
                  <div className="font-semibold text-gray-800">Select Location Method:</div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Method 1: Google Map */}
                    <button
                      type="button"
                      onClick={() => setShowMapModal(true)}
                      className="location-method-btn border-blue-300 hover:border-blue-500 hover:bg-blue-50"
                    >
                      <div className="text-4xl mb-3">🗺️</div>
                      <div className="font-bold text-gray-800">Google Map</div>
                      <div className="text-sm text-gray-600 mt-2">Pin exact location & auto-fill address</div>
                    </button>

                    {/* Method 2: Auto-detect */}
                    <button
                      type="button"
                      onClick={handleManualGeocode}
                      disabled={geocoding || !formData.city}
                      className={
                        geocoding
                          ? 'location-method-btn border-gray-300 bg-gray-100 cursor-not-allowed'
                          : 'location-method-btn border-green-300 hover:border-green-500 hover:bg-green-50'
                      }
                    >
                      <div className="text-4xl mb-3">📍</div>
                      <div className="font-bold text-gray-800">Auto Detect</div>
                      <div className="text-sm text-gray-600 mt-2">Using city name</div>
                    </button>

                    {/* Method 3: Current Location */}
                    <button
                      type="button"
                      onClick={useCurrentLocation}
                      disabled={geocoding}
                      className={`location-method-btn border-purple-300 hover:border-purple-500 hover:bg-purple-50 ${
                        geocoding ? 'opacity-50 cursor-not-allowed' : ''
                      }`}
                    >
                      <div className="text-4xl mb-3">📱</div>
                      <div className="font-bold text-gray-800">Current Location</div>
                      <div className="text-sm text-gray-600 mt-2">Use GPS location</div>
                    </button>
                  </div>
                </div>

                {/* Geocoding Status */}
                {geocoding && (
                  <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-4">
                    <div className="flex items-center gap-4">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      <span className="text-blue-900 font-bold">🔍 Finding location...</span>
                    </div>
                  </div>
                )}

                {/* Address Preview */}
                {(formData.address || formData.city) && (
                  <div className="bg-gray-100 border-2 border-gray-300 p-5 rounded-xl">
                    <div className="font-bold text-gray-900 mb-3 text-lg">📍 Address Preview:</div>
                    <div className="space-y-2">
                      {formData.address && (
                        <div className="flex items-center gap-4">
                          <span className="text-gray-700 w-24 font-medium">Street:</span>
                          <span className="font-bold text-gray-900">{formData.address}</span>
                        </div>
                      )}
                      {formData.city && (
                        <div className="flex items-center gap-4">
                          <span className="text-gray-700 w-24 font-medium">City:</span>
                          <span className="font-bold text-gray-900">{formData.city}</span>
                        </div>
                      )}
                      {formData.state && (
                        <div className="flex items-center gap-4">
                          <span className="text-gray-700 w-24 font-medium">Province:</span>
                          <span className="font-bold text-gray-900">{formData.state}</span>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Coordinates Display */}
                {formData.latitude && formData.longitude && (
                  <div className="bg-green-100 border-2 border-green-300 p-5 rounded-xl">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-5">
                      <div>
                        <div className="font-bold text-green-900 mb-2 text-lg">📍 Location Coordinates Set</div>
                        <div className="text-green-800">
                          Latitude: <span className="font-mono font-bold text-lg">{Number(formData.latitude).toFixed(6)}</span>
                          <span className="mx-3">•</span>
                          Longitude: <span className="font-mono font-bold text-lg">{Number(formData.longitude).toFixed(6)}</span>
                        </div>
                      </div>
                      <div className="flex gap-3">
                        <a
                          href={`https://www.google.com/maps?q=${formData.latitude},${formData.longitude}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="btn-secondary bg-blue-100 text-blue-700 hover:bg-blue-200 px-4 py-2"
                        >
                          View on Map
                        </a>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({ ...prev, latitude: '', longitude: '' }));
                            setSelectedLocation(null);
                          }}
                          className="btn-secondary bg-red-100 text-red-700 hover:bg-red-200 px-4 py-2"
                        >
                          Clear
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Features & Amenities Section */}
            <div className="form-section">
              <h2 className="text-2xl font-bold text-[var(--color-primary)] mb-6 flex items-center gap-2">
                ✨ Features & Amenities
              </h2>

              {/* Furnishing */}
              <div className="mb-8">
                <label className="form-label mb-4">Furnishing Status *</label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  {furnishingOptions.map(option => (
                    <button
                      key={option.value}
                      type="button"
                      onClick={() => setFormData({...formData, furnishing: option.value})}
                      className={
                        formData.furnishing === option.value
                          ? 'property-type-btn-active'
                          : 'property-type-btn'
                      }
                    >
                      <div className="font-bold text-lg mb-2">{option.label}</div>
                      <div className="text-gray-600">{option.desc}</div>
                    </button>
                  ))}
                </div>
              </div>

              {/* Amenities */}
              <div>
                <label className="form-label mb-4">Amenities (Select all that apply)</label>
                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
                  {amenitiesList.map(amenity => (
                    <button
                      key={amenity.id}
                      type="button"
                      onClick={() => toggleAmenity(amenity.id)}
                      className={
                        formData.amenities.includes(amenity.id)
                          ? 'amenity-btn-active'
                          : 'amenity-btn'
                      }
                    >
                      <span className="text-3xl mb-2">{amenity.icon}</span>
                      <span className="font-medium">{amenity.label}</span>
                    </button>
                  ))}
                </div>
                <p className="text-gray-600 mt-4">
                  Selected: <span className="font-bold text-[var(--color-primary)]">{formData.amenities.length}</span> amenities
                </p>
              </div>

              {/* Options */}
              <div className="mt-8 space-y-5">
                <label className="flex items-start gap-4 cursor-pointer p-4 hover:bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    name="is_available"
                    checked={formData.is_available}
                    onChange={handleChange}
                    className="h-6 w-6 text-blue-600 rounded mt-1"
                  />
                  <div>
                    <div className="font-bold text-lg text-gray-900">Available for Rent</div>
                    <div className="text-gray-600">Property is currently available</div>
                  </div>
                </label>

                <label className="flex items-start gap-4 cursor-pointer p-4 hover:bg-gray-50 rounded-xl">
                  <input
                    type="checkbox"
                    name="instant_booking"
                    checked={formData.instant_booking}
                    onChange={handleChange}
                    className="h-6 w-6 text-blue-600 rounded mt-1"
                  />
                  <div>
                    <div className="font-bold text-lg text-gray-900">⚡ Enable Instant Booking</div>
                    <div className="text-gray-600">
                      Tenants can book immediately without your approval
                    </div>
                  </div>
                </label>
              </div>
            </div>

      {/* Images Section */}
<div className="form-section py-6">
  <h2 className="text-xl font-semibold text-[var(--color-primary)] mb-4 flex items-center gap-2">
    📸 Property Images
  </h2>

  <div className="mb-4">
    <label className="form-label text-sm">
      Upload Images (Max 10)
    </label>

    <div className="relative">
      <input
        type="file"
        accept="image/*"
        multiple
        onChange={handleImageUpload}
        className="w-full px-4 py-6 border-2 border-dashed border-gray-300 rounded-lg hover:border-blue-500 cursor-pointer"
      />

      <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none">
        <div className="text-3xl mb-2">📁</div>
        <div className="text-sm font-medium text-gray-700">
          Click or drag images
        </div>
        <div className="text-xs text-gray-500">
          JPG / PNG up to 5MB
        </div>
      </div>
    </div>
  </div>

  {/* Preview Images */}
  {previewUrls.length > 0 && (
    <div className="grid grid-cols-3 md:grid-cols-5 gap-3 mt-4">
      {previewUrls.map((url, index) => (
        <div key={index} className="relative group">
          <img
            src={url}
            alt={`Preview ${index + 1}`}
            className="w-full h-30 object-cover rounded-lg shadow"
          />

          <button
            type="button"
            onClick={() => removeImage(index)}
            className="absolute top-1 right-1 bg-red-500 text-white rounded-full w-6 h-6 text-sm flex items-center justify-center hover:bg-red-600"
          >
            ×
          </button>

          {index === 0 && (
            <span className="absolute bottom-1 left-1 bg-blue-500 text-white text-xs px-2 py-0.5 rounded">
              Primary
            </span>
          )}
        </div>
      ))}
    </div>
  )}

  {(existingImages.length === 0 && previewUrls.length === 0) && (
    <div className="text-center py-6">
      <div className="text-4xl mb-2 text-gray-400">🖼️</div>
      <p className="text-sm text-gray-500">
        No images uploaded
      </p>
    </div>
  )}
</div>

          </div>

          {/* Submit Buttons */}
          <div className="bg-white p-6 rounded-2xl shadow-lg border border-gray-200 mt-8">
            <div className="flex flex-col sm:flex-row justify-end gap-4">
              <button
                type="button"
                onClick={() => navigate('/owner/properties')}
                className="btn-secondary px-10 py-4 text-lg font-bold"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || geocoding}
                className="btn-primary px-10 py-4 text-lg font-bold flex items-center justify-center gap-3"
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-white"></div>
                    {id ? 'Updating...' : 'Adding...'}
                  </>
                ) : (
                  <>
                    {id ? '💾 Update Property' : '➕ Add Property'}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>

      {/* Map Modal */}
      <MapModal
        showMapModal={showMapModal}
        onClose={() => setShowMapModal(false)}
        formData={formData}
        onLocationSelect={handleMapLocationSelect}
        selectedLocation={selectedLocation}
        setSelectedLocation={setSelectedLocation}
      />
    </div>
  );
};

export default PropertyForm;