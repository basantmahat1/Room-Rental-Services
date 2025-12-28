// frontend/src/components/Map/MapModal.jsx
// Complete rewrite using React Leaflet (removed Google Maps)

import React, { useState, useRef, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix Leaflet marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom marker icon
const locationIcon = L.divIcon({
  className: 'custom-pin-marker',
  html: `<div style="
    font-size: 40px; 
    transform: translate(-50%, -100%);
    filter: drop-shadow(0 3px 6px rgba(0,0,0,0.4));
  ">📍</div>`,
  iconSize: [40, 40],
  iconAnchor: [20, 40],
});

// Map click handler component
const MapClickHandler = ({ onLocationSelect }) => {
  useMapEvents({
    click: (e) => {
      onLocationSelect({
        lat: e.latlng.lat,
        lng: e.latlng.lng
      });
    }
  });
  return null;
};

const MapModal = ({ 
  showMapModal, 
  onClose, 
  formData, 
  onLocationSelect,
  selectedLocation,
  setSelectedLocation 
}) => {
  const [loading, setLoading] = useState(false);
  const [address, setAddress] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const mapRef = useRef(null);

  // Initial center (Kathmandu, Nepal)
  const defaultCenter = [27.7172, 85.3240];
  const [center, setCenter] = useState(
    selectedLocation 
      ? [selectedLocation.lat, selectedLocation.lng]
      : (formData.latitude && formData.longitude)
        ? [parseFloat(formData.latitude), parseFloat(formData.longitude)]
        : defaultCenter
  );

  useEffect(() => {
    if (selectedLocation) {
      reverseGeocode(selectedLocation.lat, selectedLocation.lng);
    }
  }, [selectedLocation]);

  // Handle map click
  const handleMapClick = (location) => {
    setSelectedLocation(location);
    reverseGeocode(location.lat, location.lng);
  };

  // Reverse geocode to get address
  const reverseGeocode = async (lat, lng) => {
    try {
      const response = await fetch(
        `http://localhost:5000/api/maps/reverse-geocode?lat=${lat}&lng=${lng}`
      );
      const data = await response.json();
      
      if (data.success) {
        setAddress(data.address);
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  // Search location by address
  const handleSearch = async () => {
    if (!searchInput.trim()) {
      alert('Please enter an address to search');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(
        `http://localhost:5000/api/maps/geocode?address=${encodeURIComponent(searchInput + ', Nepal')}`
      );
      const data = await response.json();

      if (data.success) {
        const newLocation = {
          lat: data.location.lat,
          lng: data.location.lng
        };
        setSelectedLocation(newLocation);
        setCenter([newLocation.lat, newLocation.lng]);
        setAddress(data.formatted_address);
        
        // Pan map to new location
        if (mapRef.current) {
          mapRef.current.setView([newLocation.lat, newLocation.lng], 15);
        }
      } else {
        alert('Location not found. Please try a different search.');
      }
    } catch (error) {
      console.error('Geocoding error:', error);
      alert('Failed to search location. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  // Use current GPS location
  const useCurrentLocation = () => {
    setLoading(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          const newLocation = {
            lat: position.coords.latitude,
            lng: position.coords.longitude
          };
          setSelectedLocation(newLocation);
          setCenter([newLocation.lat, newLocation.lng]);
          reverseGeocode(newLocation.lat, newLocation.lng);
          
          if (mapRef.current) {
            mapRef.current.setView([newLocation.lat, newLocation.lng], 15);
          }
          setLoading(false);
        },
        (error) => {
          console.error('Geolocation error:', error);
          alert('Unable to get your location. Please enable location services.');
          setLoading(false);
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      setLoading(false);
    }
  };

  // Confirm and apply location
  const handleConfirm = () => {
    if (!selectedLocation) {
      alert('Please select a location on the map');
      return;
    }

    // Extract address components
    const addressParts = address.split(',').map(part => part.trim());
    
    onLocationSelect({
      latitude: selectedLocation.lat.toString(),
      longitude: selectedLocation.lng.toString(),
      address: addressParts[0] || formData.address,
      city: addressParts[1] || formData.city,
      formatted_address: address
    });

    onClose();
  };

  if (!showMapModal) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-[9999] flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-5xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="bg-gradient-to-r from-blue-600 to-blue-700 text-white p-6 flex justify-between items-center">
          <div>
            <h2 className="text-2xl font-bold flex items-center gap-3">
              🗺️ Select Location
            </h2>
            <p className="text-blue-100 mt-1">Click on the map to pin your property location</p>
          </div>
          <button
            onClick={onClose}
            className="text-white hover:bg-white hover:bg-opacity-20 rounded-full p-2 transition-all"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Search Bar */}
        <div className="p-4 bg-gray-50 border-b">
          <div className="flex gap-3">
            <div className="flex-1 relative">
              <input
                type="text"
                value={searchInput}
                onChange={(e) => setSearchInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                placeholder="Search for a location (e.g., Butwal, Kathmandu)"
                className="w-full px-4 py-3 pr-10 border-2 border-gray-300 rounded-lg focus:outline-none focus:border-blue-500"
              />
              <span className="absolute right-3 top-3 text-gray-400">🔍</span>
            </div>
            <button
              onClick={handleSearch}
              disabled={loading}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50"
            >
              {loading ? '⏳' : 'Search'}
            </button>
            <button
              onClick={useCurrentLocation}
              disabled={loading}
              className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 font-semibold disabled:opacity-50"
              title="Use my current location"
            >
              📍 GPS
            </button>
          </div>
        </div>

        {/* Map Container */}
        <div className="flex-1 relative">
          <MapContainer
            center={center}
            zoom={13}
            style={{ height: '100%', width: '100%' }}
            ref={mapRef}
            scrollWheelZoom={true}
          >
            <TileLayer
              attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
              url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            />
            
            <MapClickHandler onLocationSelect={handleMapClick} />
            
            {selectedLocation && (
              <Marker 
                position={[selectedLocation.lat, selectedLocation.lng]}
                icon={locationIcon}
              />
            )}
          </MapContainer>

          {/* Instructions Overlay */}
          <div className="absolute top-4 left-4 bg-white bg-opacity-95 p-4 rounded-lg shadow-lg z-[1000] max-w-xs">
            <div className="font-bold text-gray-900 mb-2">📌 How to use:</div>
            <ol className="text-sm text-gray-700 space-y-1">
              <li>• Click anywhere on the map to place marker</li>
              <li>• Use search bar to find locations</li>
              <li>• Click GPS to use current location</li>
              <li>• Drag/zoom the map to explore</li>
            </ol>
          </div>
        </div>

        {/* Selected Location Info */}
        {selectedLocation && (
          <div className="p-4 bg-green-50 border-t-2 border-green-300">
            <div className="flex items-start gap-4">
              <div className="text-3xl">✅</div>
              <div className="flex-1">
                <div className="font-bold text-green-900 mb-1">Location Selected</div>
                <div className="text-sm text-green-800 mb-2">
                  <strong>Coordinates:</strong> {selectedLocation.lat.toFixed(6)}, {selectedLocation.lng.toFixed(6)}
                </div>
                {address && (
                  <div className="text-sm text-green-800">
                    <strong>Address:</strong> {address}
                  </div>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="p-4 bg-gray-50 border-t flex justify-between items-center">
          <div className="text-sm text-gray-600">
            {selectedLocation ? (
              <span className="text-green-700 font-semibold">✓ Location ready to confirm</span>
            ) : (
              <span>Click on the map to select a location</span>
            )}
          </div>
          <div className="flex gap-3">
            <button
              onClick={onClose}
              className="px-6 py-3 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 font-semibold"
            >
              Cancel
            </button>
            <button
              onClick={handleConfirm}
              disabled={!selectedLocation}
              className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-semibold disabled:opacity-50 disabled:cursor-not-allowed"
            >
              ✓ Confirm Location
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;