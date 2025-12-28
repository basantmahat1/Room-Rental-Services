import React, { useState, useRef } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { api } from '../../services/api';

// Fix leaflet marker icon issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png',
});

// Location picker component
const LocationPicker = ({ onLocationSelect }) => {
  const mapRef = useRef();
  const [markerPosition, setMarkerPosition] = useState(null);

  const MapClickHandler = () => {
    useMapEvents({
      click(e) {
        const { lat, lng } = e.latlng;
        setMarkerPosition([lat, lng]);
        onLocationSelect({
          latitude: lat,
          longitude: lng,
        });
      },
    });
    return null;
  };

  return (
    <div className="mb-6">
      <label className="block text-sm font-semibold mb-2 text-gray-700">
        Select Property Location on Map *
      </label>
      <div className="h-96 border-2 border-gray-300 rounded-lg overflow-hidden">
        <MapContainer
          center={[27.7172, 85.324]} // Nepal center
          zoom={13}
          style={{ height: '100%', width: '100%' }}
          ref={mapRef}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap contributors'
          />
          {markerPosition && <Marker position={markerPosition} />}
          <MapClickHandler />
        </MapContainer>
      </div>
      {markerPosition && (
        <div className="mt-2 text-sm text-green-600">
          ✓ Location selected: {markerPosition[0].toFixed(6)}, {markerPosition[1].toFixed(6)}
        </div>
      )}
    </div>
  );
};

export default function AddPropertyForm({ onSuccess }) {
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    property_type: 'rent',
    price: '',
    total_area: '',
    area_unit: 'sqft',
    number_of_rooms: '',
    number_of_bathrooms: '',
    location_description: '',
    latitude: '',
    longitude: '',
    contact_phone: '',
    contact_email: '',
    status: 1,
  });

  const [images, setImages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === 'checkbox' ? (checked ? 1 : 0) : value,
    });
  };

  const handleLocationSelect = (location) => {
    setFormData({
      ...formData,
      latitude: location.latitude,
      longitude: location.longitude,
    });
  };

  const handleImageUpload = (e) => {
    const files = Array.from(e.target.files);
    setImages([...images, ...files]);
  };

  const removeImage = (index) => {
    setImages(images.filter((_, i) => i !== index));
  };

  const validateForm = () => {
    if (!formData.title) return 'Title is required';
    if (!formData.price) return 'Price is required';
    if (!formData.total_area) return 'Total area is required';
    if (!formData.number_of_rooms) return 'Number of rooms is required';
    if (!formData.number_of_bathrooms) return 'Number of bathrooms is required';
    if (!formData.latitude || !formData.longitude) return 'Please select location on map';
    if (!formData.contact_phone) return 'Contact phone is required';
    if (images.length === 0) return 'Please upload at least one image';
    return '';
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const validationError = validateForm();
    if (validationError) {
      setError(validationError);
      return;
    }

    setLoading(true);
    setError('');

    try {
      // Upload images first
      const uploadedImages = [];
      for (let image of images) {
        const imageFormData = new FormData();
        imageFormData.append('file', image);

        const uploadResponse = await api.post('/upload', imageFormData, {
          headers: { 'Content-Type': 'multipart/form-data' },
        });

        uploadedImages.push(uploadResponse.data.url);
      }

      // Create property
      const propertyData = {
        ...formData,
        price: parseFloat(formData.price),
        total_area: parseFloat(formData.total_area),
        number_of_rooms: parseInt(formData.number_of_rooms),
        number_of_bathrooms: parseInt(formData.number_of_bathrooms),
        latitude: parseFloat(formData.latitude),
        longitude: parseFloat(formData.longitude),
        images: uploadedImages,
        primary_image: uploadedImages[0],
      };

      const response = await api.post('/properties', propertyData);

      setSuccess('Property added successfully!');
      setFormData({
        title: '',
        description: '',
        property_type: 'rent',
        price: '',
        total_area: '',
        area_unit: 'sqft',
        number_of_rooms: '',
        number_of_bathrooms: '',
        location_description: '',
        latitude: '',
        longitude: '',
        contact_phone: '',
        contact_email: '',
        status: 1,
      });
      setImages([]);

      if (onSuccess) {
        onSuccess(response.data);
      }

      setTimeout(() => setSuccess(''), 3000);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to add property');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto bg-white rounded-lg shadow-lg p-8">
      <h1 className="text-3xl font-bold mb-6 text-gray-800">Add New Property</h1>

      {error && (
        <div className="mb-4 p-4 bg-red-100 border border-red-400 text-red-700 rounded">
          {error}
        </div>
      )}

      {success && (
        <div className="mb-4 p-4 bg-green-100 border border-green-400 text-green-700 rounded">
          {success}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Property Title *
            </label>
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleInputChange}
              placeholder="e.g., Modern Apartment in Thamel"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Property Type *
            </label>
            <select
              name="property_type"
              value={formData.property_type}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="rent">For Rent</option>
              <option value="sale">For Sale</option>
            </select>
          </div>
        </div>

        {/* Price and Area */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Price (NPR) *
            </label>
            <input
              type="number"
              name="price"
              value={formData.price}
              onChange={handleInputChange}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Total Area *
            </label>
            <input
              type="number"
              name="total_area"
              value={formData.total_area}
              onChange={handleInputChange}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Area Unit
            </label>
            <select
              name="area_unit"
              value={formData.area_unit}
              onChange={handleInputChange}
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            >
              <option value="sqft">Sq Ft</option>
              <option value="ropani">Ropani</option>
            </select>
          </div>
        </div>

        {/* Rooms and Bathrooms */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Number of Rooms *
            </label>
            <input
              type="number"
              name="number_of_rooms"
              value={formData.number_of_rooms}
              onChange={handleInputChange}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Number of Bathrooms *
            </label>
            <input
              type="number"
              name="number_of_bathrooms"
              value={formData.number_of_bathrooms}
              onChange={handleInputChange}
              placeholder="0"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Location Selection on Map */}
        <LocationPicker onLocationSelect={handleLocationSelect} />

        {/* Location Description */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">
            Location Description
          </label>
          <input
            type="text"
            name="location_description"
            value={formData.location_description}
            onChange={handleInputChange}
            placeholder="e.g., Thamel, Near Durbar Square"
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          />
        </div>

        {/* Contact Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Contact Phone *
            </label>
            <input
              type="tel"
              name="contact_phone"
              value={formData.contact_phone}
              onChange={handleInputChange}
              placeholder="98XXXXXXXX"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>

          <div>
            <label className="block text-sm font-semibold mb-1 text-gray-700">
              Contact Email
            </label>
            <input
              type="email"
              name="contact_email"
              value={formData.contact_email}
              onChange={handleInputChange}
              placeholder="email@example.com"
              className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
            />
          </div>
        </div>

        {/* Description */}
        <div>
          <label className="block text-sm font-semibold mb-1 text-gray-700">
            Property Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows="5"
            placeholder="Describe your property in detail..."
            className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
          ></textarea>
        </div>

        {/* Image Upload */}
        <div>
          <label className="block text-sm font-semibold mb-2 text-gray-700">
            Property Images * (minimum 1)
          </label>
          <input
            type="file"
            multiple
            accept="image/*"
            onChange={handleImageUpload}
            className="w-full px-4 py-2 border border-gray-300 rounded-lg"
          />

          {images.length > 0 && (
            <div className="mt-4 grid grid-cols-3 gap-4">
              {images.map((image, index) => (
                <div key={index} className="relative">
                  <img
                    src={URL.createObjectURL(image)}
                    alt={`Preview ${index}`}
                    className="w-full h-24 object-cover rounded-lg"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 hover:bg-red-600"
                  >
                    ✕
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Status */}
        <div className="flex items-center">
          <input
            type="checkbox"
            name="status"
            checked={formData.status === 1}
            onChange={handleInputChange}
            id="status"
            className="h-4 w-4 text-blue-600 border-gray-300 rounded"
          />
          <label htmlFor="status" className="ml-2 text-sm text-gray-700">
            Publish immediately (Active)
          </label>
        </div>

        {/* Submit Button */}
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-blue-600 text-white font-bold py-3 rounded-lg hover:bg-blue-700 disabled:bg-gray-400 transition"
        >
          {loading ? 'Adding Property...' : 'Add Property'}
        </button>
      </form>
    </div>
  );
}
