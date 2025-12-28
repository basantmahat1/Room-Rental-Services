import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../../services/api';

// Fix leaflet marker icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

const PropertyCard = ({ property, onViewMap }) => {
  const [inWishlist, setInWishlist] = useState(false);

  const handleWishlist = async (e) => {
    e.preventDefault();
    try {
      if (inWishlist) {
        // await api.delete(`/wishlist/${property.id}`);
      } else {
        // await api.post('/wishlist', { property_id: property.id });
      }
      setInWishlist(!inWishlist);
    } catch (error) {
      console.error('Error updating wishlist:', error);
    }
  };

  const primaryImage = property.primary_image || property.images?.[0] || '/placeholder.jpg';

  return (
    <div className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition duration-300">
      {/* Image Container */}
      <div className="relative h-48 overflow-hidden bg-gray-200">
        <img
          src={primaryImage}
          alt={property.title}
          className="w-full h-full object-cover hover:scale-105 transition"
        />
        <button
          onClick={handleWishlist}
          className={`absolute top-3 right-3 p-2 rounded-full transition ${
            inWishlist ? 'bg-red-500 text-white' : 'bg-white text-gray-600'
          }`}
        >
          ♥
        </button>
        <div className="absolute top-3 left-3 bg-blue-600 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {property.property_type === 'rent' ? 'Rent' : 'Sale'}
        </div>
      </div>

      {/* Content Container */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800 mb-1 truncate">
          {property.title}
        </h3>

        {/* Location */}
        <p className="text-sm text-gray-600 mb-3 flex items-center">
          📍 {property.location_description || 'Location not specified'}
        </p>

        {/* Price */}
        <div className="mb-3 text-xl font-bold text-green-600">
          Rs. {parseInt(property.price).toLocaleString()}
          {property.property_type === 'rent' && <span className="text-sm text-gray-500">/month</span>}
        </div>

        {/* Property Details */}
        <div className="grid grid-cols-3 gap-2 mb-3 text-sm text-gray-600">
          <div className="text-center">
            <div className="font-semibold text-gray-800">{property.number_of_rooms}</div>
            <div className="text-xs">Rooms</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-800">{property.number_of_bathrooms}</div>
            <div className="text-xs">Bathrooms</div>
          </div>
          <div className="text-center">
            <div className="font-semibold text-gray-800">{property.total_area}</div>
            <div className="text-xs">{property.area_unit || 'sqft'}</div>
          </div>
        </div>

        {/* Buttons */}
        <div className="space-y-2">
          <Link
            to={`/property/${property.id}`}
            className="block w-full text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
          >
            View Details
          </Link>
          <button
            onClick={() => onViewMap(property)}
            className="w-full border-2 border-blue-600 text-blue-600 py-2 rounded-lg hover:bg-blue-50 transition font-semibold"
          >
            View on Map
          </button>
        </div>
      </div>
    </div>
  );
};

const PropertyGrid = ({ filters = {} }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [showMapModal, setShowMapModal] = useState(false);

  useEffect(() => {
    fetchProperties();
  }, [filters]);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const queryParams = new URLSearchParams({
        status: 1, // Only active properties
        limit: 20,
        ...filters,
      });

      const response = await api.get(`/properties?${queryParams}`);
      setProperties(response.data.properties || []);
      setError('');
    } catch (err) {
      setError('Failed to load properties');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleViewMap = (property) => {
    setSelectedProperty(property);
    setShowMapModal(true);
  };

  if (loading) {
    return <div className="text-center py-12 text-gray-500">Loading properties...</div>;
  }

  if (error) {
    return <div className="text-center py-12 text-red-500">{error}</div>;
  }

  if (properties.length === 0) {
    return <div className="text-center py-12 text-gray-500">No properties found</div>;
  }

  return (
    <>
      {/* Grid Layout - 4 columns on desktop, 2 on tablet, 1 on mobile */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 p-6">
        {properties.map((property) => (
          <PropertyCard
            key={property.id}
            property={property}
            onViewMap={handleViewMap}
          />
        ))}
      </div>

      {/* Map Modal */}
      {showMapModal && selectedProperty && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-screen overflow-y-auto">
            {/* Modal Header */}
            <div className="sticky top-0 bg-white border-b p-4 flex justify-between items-center">
              <h2 className="text-xl font-bold text-gray-800">{selectedProperty.title}</h2>
              <button
                onClick={() => setShowMapModal(false)}
                className="text-gray-600 hover:text-gray-900 text-2xl"
              >
                ✕
              </button>
            </div>

            {/* Modal Body */}
            <div className="p-4">
              {/* Map */}
              <div className="h-96 mb-4 rounded-lg overflow-hidden border-2 border-gray-300">
                <MapContainer
                  center={[selectedProperty.latitude, selectedProperty.longitude]}
                  zoom={16}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <Marker position={[selectedProperty.latitude, selectedProperty.longitude]}>
                    <Popup>
                      <div className="text-center">
                        <p className="font-bold">{selectedProperty.title}</p>
                        <p>Rs. {parseInt(selectedProperty.price).toLocaleString()}</p>
                      </div>
                    </Popup>
                  </Marker>
                </MapContainer>
              </div>

              {/* Property Details */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-gray-600 text-sm">Property Type</p>
                  <p className="font-bold text-lg">
                    {selectedProperty.property_type === 'rent' ? 'For Rent' : 'For Sale'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Price</p>
                  <p className="font-bold text-lg text-green-600">
                    Rs. {parseInt(selectedProperty.price).toLocaleString()}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Rooms</p>
                  <p className="font-bold text-lg">{selectedProperty.number_of_rooms}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Bathrooms</p>
                  <p className="font-bold text-lg">{selectedProperty.number_of_bathrooms}</p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Area</p>
                  <p className="font-bold text-lg">
                    {selectedProperty.total_area} {selectedProperty.area_unit || 'sqft'}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600 text-sm">Location</p>
                  <p className="font-bold text-lg">{selectedProperty.location_description}</p>
                </div>
              </div>

              {/* Coordinates */}
              <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                <p className="text-sm text-gray-600">
                  📍 Coordinates: {selectedProperty.latitude.toFixed(6)}, {selectedProperty.longitude.toFixed(6)}
                </p>
              </div>

              {/* Contact */}
              <div className="mt-4 p-4 bg-blue-50 rounded-lg">
                <p className="font-semibold text-gray-800 mb-2">Contact Owner</p>
                <p className="text-gray-700">📞 {selectedProperty.contact_phone}</p>
                {selectedProperty.contact_email && (
                  <p className="text-gray-700">📧 {selectedProperty.contact_email}</p>
                )}
              </div>
            </div>

            {/* Modal Footer */}
            <div className="sticky bottom-0 bg-gray-100 border-t p-4">
              <Link
                to={`/property/${selectedProperty.id}`}
                className="w-full block text-center bg-blue-600 text-white py-2 rounded-lg hover:bg-blue-700 transition font-semibold"
              >
                View Full Details
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyGrid;
