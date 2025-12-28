import React from 'react';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix marker icons
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const MapView = ({ 
  latitude, 
  longitude, 
  propertyTitle = 'Property Location',
  address = '',
  height = '400px',
  zoom = 15,
  showControls = true
}) => {
  if (!latitude || !longitude) {
    return (
      <div style={{ 
        height, 
        display: 'flex', 
        alignItems: 'center', 
        justifyContent: 'center',
        background: '#f5f5f5',
        borderRadius: '8px'
      }}>
        <p style={{ color: '#999' }}>📍 Location not available</p>
      </div>
    );
  }

  return (
    <MapContainer
      center={[parseFloat(latitude), parseFloat(longitude)]}
      zoom={zoom}
      style={{ height, width: '100%', borderRadius: '8px' }}
      scrollWheelZoom={showControls}
      dragging={showControls}
    >
      <TileLayer
        attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
      />
      <Marker position={[parseFloat(latitude), parseFloat(longitude)]}>
        <Popup>
          <div style={{ padding: '8px' }}>
            <strong style={{ fontSize: '14px', color: '#00BFA5' }}>
              {propertyTitle}
            </strong>
            {address && (
              <p style={{ margin: '5px 0 0 0', fontSize: '12px', color: '#666' }}>
                📍 {address}
              </p>
            )}
          </div>
        </Popup>
      </Marker>
    </MapContainer>
  );
};

export default MapView;
