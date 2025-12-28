import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup, Circle } from 'react-leaflet';
import { Icon } from 'leaflet';
import 'leaflet/dist/leaflet.css';

const PropertySearch = () => {
  const navigate = useNavigate();
  const [filters, setFilters] = useState({
    city: '',
    property_type: '',
    min_price: '',
    max_price: '',
    bedrooms: '',
    furnishing: '',
    amenities: [],
    sort_by: 'newest',
    lat: null,
    lng: null,
    radius: 5
  });
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(false);
  const [mapCenter, setMapCenter] = useState([28.3949, 84.1240]); // Nepal coordinates
  const [nearbyPlaces, setNearbyPlaces] = useState([]);

  const propertyTypes = [
    { value: 'apartment', label: 'Apartment' },
    { value: 'house', label: 'House' },
    { value: 'room', label: 'Room' },
    { value: 'studio', label: 'Studio' },
    { value: 'commercial', label: 'Commercial' }
  ];

  const furnishingOptions = [
    { value: 'furnished', label: 'Furnished' },
    { value: 'semi_furnished', label: 'Semi-Furnished' },
    { value: 'unfurnished', label: 'Unfurnished' }
  ];

  const amenitiesList = [
    { id: 'wifi', label: 'WiFi', icon: '📶' },
    { id: 'parking', label: 'Parking', icon: '🅿️' },
    { id: 'water', label: 'Water Supply', icon: '💧' },
    { id: 'kitchen', label: 'Kitchen', icon: '🍳' },
    { id: 'ac', label: 'Air Conditioning', icon: '❄️' },
    { id: 'laundry', label: 'Laundry', icon: '👕' },
    { id: 'security', label: 'Security', icon: '🔒' },
    { id: 'pool', label: 'Swimming Pool', icon: '🏊' },
    { id: 'gym', label: 'Gym', icon: '💪' },
    { id: 'elevator', label: 'Elevator', icon: '🛗' }
  ];

  const sortOptions = [
    { value: 'newest', label: 'Newest' },
    { value: 'price_low', label: 'Price: Low to High' },
    { value: 'price_high', label: 'Price: High to Low' },
    { value: 'most_viewed', label: 'Most Viewed' },
    { value: 'rating', label: 'Highest Rated' }
  ];

  // Get user location
  useEffect(() => {
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const { latitude, longitude } = position.coords;
          setMapCenter([latitude, longitude]);
          setFilters(prev => ({
            ...prev,
            lat: latitude,
            lng: longitude
          }));
        },
        () => {
          console.log('Location access denied');
        }
      );
    }
  }, []);

  // Search properties
  const searchProperties = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== null && value !== '' && value !== false) {
          if (Array.isArray(value)) {
            if (value.length > 0) {
              params.append(key, value.join(','));
            }
          } else {
            params.append(key, value);
          }
        }
      });

      const response = await fetch(`/api/properties/search?${params}`);
      const data = await response.json();
      setProperties(data.properties || []);

      // Get nearby places
      if (filters.lat && filters.lng) {
        getNearbyPlaces();
      }
    } catch (error) {
      console.error('Search error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Get nearby places
  const getNearbyPlaces = async () => {
    try {
      const response = await fetch(
        `/api/maps/nearby-places?lat=${filters.lat}&lng=${filters.lng}`
      );
      const data = await response.json();
      setNearbyPlaces(data.places || []);
    } catch (error) {
      console.error('Nearby places error:', error);
    }
  };

  // Handle filter change
  const handleFilterChange = (key, value) => {
    setFilters(prev => ({
      ...prev,
      [key]: value
    }));
  };

  // Handle amenity toggle
  const toggleAmenity = (amenityId) => {
    setFilters(prev => {
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

  // Handle map click
  const handleMapClick = (e) => {
    const { lat, lng } = e.latlng;
    setMapCenter([lat, lng]);
    setFilters(prev => ({
      ...prev,
      lat,
      lng
    }));
  };

  // Custom marker icon
  const customIcon = new Icon({
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    iconSize: [25, 41],
    iconAnchor: [12, 41]
  });

  return (
    <div className="flex flex-col lg:flex-row gap-6 p-4">
      {/* Filters Sidebar */}
      <div className="lg:w-1/4">
        <div className="bg-white rounded-lg shadow-md p-6 sticky top-4">
          <h2 className="text-xl font-bold mb-4">Filters</h2>

          {/* Location Search */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Location
            </label>
            <input
              type="text"
              placeholder="City or area"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.city}
              onChange={(e) => handleFilterChange('city', e.target.value)}
            />
          </div>

          {/* Property Type */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Property Type
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.property_type}
              onChange={(e) => handleFilterChange('property_type', e.target.value)}
            >
              <option value="">All Types</option>
              {propertyTypes.map(type => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
          </div>

          {/* Price Range */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Price Range (per month)
            </label>
            <div className="flex gap-2">
              <input
                type="number"
                placeholder="Min"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.min_price}
                onChange={(e) => handleFilterChange('min_price', e.target.value)}
              />
              <input
                type="number"
                placeholder="Max"
                className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                value={filters.max_price}
                onChange={(e) => handleFilterChange('max_price', e.target.value)}
              />
            </div>
          </div>

          {/* Bedrooms */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Bedrooms
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.bedrooms}
              onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
            >
              <option value="">Any</option>
              <option value="1">1</option>
              <option value="2">2</option>
              <option value="3">3</option>
              <option value="4">4+</option>
            </select>
          </div>

          {/* Furnishing */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Furnishing
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.furnishing}
              onChange={(e) => handleFilterChange('furnishing', e.target.value)}
            >
              <option value="">Any</option>
              {furnishingOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Amenities */}
          <div className="mb-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Amenities
            </label>
            <div className="grid grid-cols-2 gap-2">
              {amenitiesList.map(amenity => (
                <button
                  key={amenity.id}
                  type="button"
                  onClick={() => toggleAmenity(amenity.id)}
                  className={`flex items-center gap-1 px-2 py-1 rounded text-sm ${
                    filters.amenities.includes(amenity.id)
                      ? 'bg-blue-100 text-blue-700 border border-blue-300'
                      : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                  }`}
                >
                  <span>{amenity.icon}</span>
                  <span>{amenity.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Sort By */}
          <div className="mb-6">
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Sort By
            </label>
            <select
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              value={filters.sort_by}
              onChange={(e) => handleFilterChange('sort_by', e.target.value)}
            >
              {sortOptions.map(option => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </div>

          {/* Search Button */}
          <button
            onClick={searchProperties}
            disabled={loading}
            className="w-full bg-blue-600 text-white py-2 px-4 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50"
          >
            {loading ? 'Searching...' : 'Search Properties'}
          </button>

          {/* Nearby Places */}
          {nearbyPlaces.length > 0 && (
            <div className="mt-6">
              <h3 className="font-medium text-gray-700 mb-2">Nearby Places</h3>
              <div className="space-y-2">
                {nearbyPlaces.map((place, index) => (
                  <div key={index} className="flex items-center gap-2 text-sm">
                    <span className="text-gray-500">
                      {place.type === 'school' ? '🏫' : 
                       place.type === 'hospital' ? '🏥' : '🚉'}
                    </span>
                    <span className="truncate">{place.name}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Main Content */}
      <div className="lg:w-3/4">
        {/* Map View */}
        <div className="mb-6">
          <div className="bg-white rounded-lg shadow-md p-4">
            <h3 className="font-bold text-lg mb-2">Map View</h3>
            <div className="h-96 rounded-lg overflow-hidden">
              <MapContainer
                center={mapCenter}
                zoom={13}
                style={{ height: '100%', width: '100%' }}
                onClick={handleMapClick}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                
                {/* Search Radius */}
                {filters.lat && filters.lng && (
                  <Circle
                    center={[filters.lat, filters.lng]}
                    radius={filters.radius * 1000}
                    color="blue"
                    fillColor="blue"
                    fillOpacity={0.1}
                  />
                )}

                {/* Property Markers */}
                {properties.map(property => (
                  <Marker
                    key={property.id}
                    position={[property.latitude, property.longitude]}
                    icon={customIcon}
                  >
                    <Popup>
                      <div className="p-2">
                        <h4 className="font-bold">{property.title}</h4>
                        <p className="text-sm text-gray-600">{property.address}</p>
                        <p className="font-bold text-green-600">${property.price}/month</p>
                        <button
                          onClick={() => navigate(`/properties/${property.id}`)}
                          className="mt-2 w-full bg-blue-600 text-white py-1 px-2 rounded text-sm hover:bg-blue-700"
                        >
                          View Details
                        </button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          </div>
        </div>

        {/* Results Header */}
        <div className="flex justify-between items-center mb-4">
          <h2 className="text-2xl font-bold">
            {properties.length} Properties Found
          </h2>
          <div className="flex gap-2">
            <button
              onClick={() => handleFilterChange('sort_by', 'price_low')}
              className={`px-3 py-1 rounded ${
                filters.sort_by === 'price_low'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Price: Low to High
            </button>
            <button
              onClick={() => handleFilterChange('sort_by', 'price_high')}
              className={`px-3 py-1 rounded ${
                filters.sort_by === 'price_high'
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              Price: High to Low
            </button>
          </div>
        </div>

        {/* Properties Grid */}
        {loading ? (
          <div className="flex justify-center items-center h-64">
            <div className="text-xl">Loading properties...</div>
          </div>
        ) : properties.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {properties.map(property => (
              <PropertyCard key={property.id} property={property} />
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <div className="text-4xl mb-4">🏠</div>
            <h3 className="text-xl font-bold mb-2">No properties found</h3>
            <p className="text-gray-600">Try adjusting your filters</p>
          </div>
        )}

        {/* Instant Booking Banner */}
        <div className="mt-8 bg-gradient-to-r from-green-500 to-emerald-600 text-white rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-xl font-bold mb-1">Instant Booking Available!</h3>
              <p className="opacity-90">Book properties instantly without waiting for owner approval</p>
            </div>
            <button className="bg-white text-green-600 font-bold py-2 px-6 rounded-lg hover:bg-gray-100">
              View Instant Book Properties
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertySearch;