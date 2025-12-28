import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { propertyAPI } from '../services/api';
import MapView from '../components/Map/MapView';
import Navbar from '../components/Layout/Navbar';

const PropertyMapPage = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [property, setProperty] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadProperty();
  }, [id]);

  const loadProperty = async () => {
    try {
      setLoading(true);
      const response = await propertyAPI.getById(id);
      setProperty(response.data.property);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to load property');
      console.error('Error loading property:', err);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto p-8 flex items-center justify-center h-screen">
          <div className="flex flex-col items-center gap-4">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
            <p className="text-gray-600">Loading property location...</p>
          </div>
        </div>
      </div>
    );
  }

  if (error || !property) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Navbar />
        <div className="max-w-6xl mx-auto p-8">
          <div className="bg-white rounded-2xl shadow-lg p-8 border border-red-200 text-center">
            <div className="text-6xl mb-4">⚠️</div>
            <h1 className="text-2xl font-bold text-gray-800 mb-2">Property Not Found</h1>
            <p className="text-gray-600 mb-6">{error || 'The property you are looking for does not exist.'}</p>
            <button
              onClick={() => navigate('/allproperties')}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-bold"
            >
              Back to Properties
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      
      <div className="max-w-6xl mx-auto p-4 md:p-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => navigate(`/properties/${id}`)}
            className="text-blue-600 hover:text-blue-800 font-semibold mb-4 flex items-center gap-2"
          >
            ← Back to Property Details
          </button>
          <h1 className="text-3xl md:text-4xl font-bold text-gray-800 mb-2">
            📍 {property.title}
          </h1>
          <p className="text-gray-600">{property.address}, {property.city}</p>
        </div>

        {/* Main Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Map Section */}
          <div className="lg:col-span-2">
            <div className="bg-white rounded-2xl shadow-lg overflow-hidden border border-gray-200">
              <MapView
                latitude={property.latitude}
                longitude={property.longitude}
                propertyTitle={property.title}
                address={property.address}
                height="600px"
                zoom={16}
                showControls={true}
              />
            </div>
          </div>

          {/* Property Info Sidebar */}
          <div className="space-y-6">
            {/* Price Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <div className="text-gray-600 text-sm mb-2">Rent Price</div>
              <div className="text-3xl font-bold text-blue-600">
                Rs. {property.price.toLocaleString()}
              </div>
              <div className="text-xs text-gray-500 mt-1">per month</div>
            </div>

            {/* Property Details Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Property Details</h3>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Type</span>
                  <span className="font-semibold text-gray-800 capitalize">{property.property_type}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-gray-600">Bedrooms</span>
                  <span className="font-semibold text-gray-800">🛏️ {property.bedrooms}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-gray-600">Bathrooms</span>
                  <span className="font-semibold text-gray-800">🚿 {property.bathrooms}</span>
                </div>
                <div className="flex items-center justify-between pb-3 border-b">
                  <span className="text-gray-600">Area</span>
                  <span className="font-semibold text-gray-800">📐 {property.area_sqft} sqft</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-600">Furnishing</span>
                  <span className="font-semibold text-gray-800 capitalize">{property.furnishing.replace('_', ' ')}</span>
                </div>
              </div>
            </div>

            {/* Location Card */}
            <div className="bg-white rounded-2xl shadow-lg p-6 border border-gray-200">
              <h3 className="font-bold text-lg mb-4 text-gray-800">Location</h3>
              <div className="space-y-2 text-sm">
                <p className="text-gray-700">
                  <span className="font-semibold">Address:</span> {property.address}
                </p>
                <p className="text-gray-700">
                  <span className="font-semibold">City:</span> {property.city}
                </p>
                {property.state && (
                  <p className="text-gray-700">
                    <span className="font-semibold">Province:</span> {property.state}
                  </p>
                )}
                <p className="text-gray-700">
                  <span className="font-semibold">Country:</span> {property.country}
                </p>
                <div className="mt-3 p-3 bg-gray-50 rounded-lg border border-gray-200">
                  <p className="text-xs font-mono text-gray-600">
                    Lat: <span className="font-semibold">{Number(property.latitude).toFixed(6)}</span>
                  </p>
                  <p className="text-xs font-mono text-gray-600">
                    Lng: <span className="font-semibold">{Number(property.longitude).toFixed(6)}</span>
                  </p>
                </div>
              </div>
            </div>

            {/* Action Button */}
            <button
              onClick={() => navigate(`/properties/${id}`)}
              className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 font-bold transition-colors"
            >
              View Full Details
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PropertyMapPage;
