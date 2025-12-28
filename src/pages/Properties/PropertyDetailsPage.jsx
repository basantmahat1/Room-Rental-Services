import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { MapContainer, TileLayer, Marker } from 'react-leaflet';
import { Phone, MapPin, Bed, Bath, Maximize2, ArrowLeft } from 'lucide-react';
import L from 'leaflet';
import api from '../../services/api';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';
import PropertyCard from '../../components/Properties/PropertyCard';

// Fix Leaflet default icon
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

export default function PropertyDetailsPage() {
  const { id } = useParams();
  const [property, setProperty] = useState(null);
  const [relatedProperties, setRelatedProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchPropertyDetails();
  }, [id]);

  const fetchPropertyDetails = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/properties/${id}`);

      if (response.data.success) {
        setProperty(response.data.property);
        // Fetch related properties (same type)
        fetchRelatedProperties(response.data.property.property_type);
      } else {
        showToast('Property not found', 'error');
      }
    } catch (error) {
      console.error('Error fetching property:', error);
      showToast('Error loading property details', 'error');
    } finally {
      setLoading(false);
    }
  };

  const fetchRelatedProperties = async (propertyType) => {
    try {
      const response = await api.get(`/properties/type/${propertyType}`);
      if (response.data.success) {
        // Filter out current property and get 4 related ones
        const related = response.data.properties
          ?.filter(p => p.id !== id)
          ?.slice(0, 4) || [];
        setRelatedProperties(related);
      }
    } catch (error) {
      console.error('Error fetching related properties:', error);
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  if (loading) {
    return <Loader />;
  }

  if (!property) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-gray-900 mb-4">Property Not Found</h1>
          <button
            onClick={() => window.history.back()}
            className="px-6 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600"
          >
            Go Back
          </button>
        </div>
      </div>
    );
  }

  // Parse images if they're stored as JSON string
  let images = [];
  if (property.images) {
    if (typeof property.images === 'string') {
      try {
        images = JSON.parse(property.images);
      } catch {
        images = [];
      }
    } else if (Array.isArray(property.images)) {
      images = property.images;
    }
  }

  // Get featured or first image
  const currentImage = property.featured_image || images[0] || 'https://via.placeholder.com/600x400?text=No+Image';

  const nextImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev + 1) % images.length);
    }
  };

  const prevImage = () => {
    if (images.length > 1) {
      setCurrentImageIndex((prev) => (prev - 1 + images.length) % images.length);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      {/* Back Button */}
      <div className="bg-white shadow-sm">
        <div className="max-w-6xl mx-auto px-4 md:px-8 py-4">
          <button
            onClick={() => window.history.back()}
            className="flex items-center text-blue-600 hover:text-blue-800 font-medium"
          >
            <ArrowLeft size={20} className="mr-2" />
            Back
          </button>
        </div>
      </div>

      <div className="max-w-6xl mx-auto px-4 md:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <div className="relative bg-gray-900 h-96">
                <img
                  src={currentImage}
                  alt="Property"
                  className="w-full h-full object-cover"
                />

                {/* Image Controls */}
                {images.length > 1 && (
                  <>
                    <button
                      onClick={prevImage}
                      className="absolute left-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition"
                    >
                      ←
                    </button>
                    <button
                      onClick={nextImage}
                      className="absolute right-4 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/75 text-white p-2 rounded-full transition"
                    >
                      →
                    </button>
                    <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-black/50 text-white px-3 py-1 rounded-full text-sm">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                )}
              </div>

              {/* Thumbnail Gallery */}
              {images.length > 1 && (
                <div className="flex gap-2 p-4 overflow-x-auto">
                  {images.map((img, idx) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition ${
                        idx === currentImageIndex ? 'border-blue-500' : 'border-gray-300'
                      }`}
                    >
                      <img src={img} alt={`Thumbnail ${idx}`} className="w-full h-full object-cover" />
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-8">
              <h1 className="text-3xl font-bold text-gray-900 mb-4">{property.title}</h1>

              {/* Price & Type */}
              <div className="flex justify-between items-center mb-6 pb-6 border-b">
                <div>
                  <div className="text-3xl font-bold text-green-600">
                    Rs. {property.price ? property.price.toLocaleString() : '0'}
                  </div>
                  <div className="text-gray-600">
                    {property.property_type === 'rent' ? 'For Rent' : 'For Sale'}
                  </div>
                </div>
                <div className="text-right">
                  <div className="inline-block bg-blue-100 text-blue-800 px-4 py-2 rounded-full font-semibold">
                    {property.property_type === 'rent' ? 'Monthly Rent' : 'Sale Price'}
                  </div>
                </div>
              </div>

              {/* Location */}
              <div className="flex items-center text-gray-700 mb-6 text-lg">
                <MapPin size={24} className="mr-3 text-red-500" />
                <span>{property.location_name || 'Location not specified'}</span>
              </div>

              {/* Key Features */}
              <div className="grid grid-cols-3 gap-6 mb-8 pb-8 border-b">
                {property.rooms && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Bed size={32} className="text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{property.rooms}</div>
                    <div className="text-gray-600">Bedrooms</div>
                  </div>
                )}
                {property.bathrooms && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Bath size={32} className="text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{property.bathrooms}</div>
                    <div className="text-gray-600">Bathrooms</div>
                  </div>
                )}
                {property.area && (
                  <div className="text-center">
                    <div className="flex items-center justify-center mb-2">
                      <Maximize2 size={32} className="text-blue-500" />
                    </div>
                    <div className="text-2xl font-bold text-gray-900">{property.area}</div>
                    <div className="text-gray-600">Sq Feet</div>
                  </div>
                )}
              </div>

              {/* Description */}
              {property.description && (
                <div className="mb-8">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Description</h2>
                  <p className="text-gray-700 leading-relaxed whitespace-pre-wrap">
                    {property.description}
                  </p>
                </div>
              )}

              {/* Contact */}
              {property.contact_phone && (
                <div className="flex items-center text-gray-700 text-lg">
                  <Phone size={24} className="mr-3 text-green-500" />
                  <a href={`tel:${property.contact_phone}`} className="hover:text-green-600">
                    {property.contact_phone}
                  </a>
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div>
            {/* Map */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-8">
              <h2 className="text-lg font-semibold text-gray-900 p-6 pb-0">Location on Map</h2>
              <div className="h-80 mt-4">
                <MapContainer
                  center={[parseFloat(property.latitude || 27.7172), parseFloat(property.longitude || 85.324)]}
                  zoom={15}
                  style={{ height: '100%', width: '100%' }}
                >
                  <TileLayer
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                    attribution='&copy; OpenStreetMap contributors'
                  />
                  <Marker position={[parseFloat(property.latitude || 27.7172), parseFloat(property.longitude || 85.324)]} />
                </MapContainer>
              </div>
              <div className="p-6 pt-4 border-t">
                <p className="text-sm text-gray-600 mb-2">
                  <strong>Latitude:</strong> {property.latitude}
                </p>
                <p className="text-sm text-gray-600">
                  <strong>Longitude:</strong> {property.longitude}
                </p>
              </div>
            </div>

            {/* Contact Card */}
            <div className="bg-blue-50 rounded-lg shadow-md p-6">
              <h2 className="text-lg font-semibold text-gray-900 mb-4">Contact Owner</h2>
              {property.contact_phone && (
                <a
                  href={`tel:${property.contact_phone}`}
                  className="block w-full px-4 py-3 bg-green-500 text-white rounded-lg text-center font-semibold hover:bg-green-600 transition mb-3"
                >
                  Call: {property.contact_phone}
                </a>
              )}
              <p className="text-sm text-gray-600 text-center">
                Listed on: {new Date(property.created_at).toLocaleDateString()}
              </p>
            </div>
          </div>
        </div>

        {/* Related Properties */}
        {relatedProperties.length > 0 && (
          <div className="mt-16">
            <h2 className="text-2xl font-bold text-gray-900 mb-8">
              Similar {property.property_type === 'rent' ? 'Rentals' : 'Properties'}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {relatedProperties.map(prop => (
                <PropertyCard key={prop.id} property={prop} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
