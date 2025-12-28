// frontend/src/components/Map/RoutingMap.jsx
// COMPLETE FILE - CREATE THIS NEW FILE

import React, { useEffect, useRef, useState } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import 'leaflet-routing-machine';
import 'leaflet-routing-machine/dist/leaflet-routing-machine.css';

// Fix marker icons for production
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
  iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
  shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Custom icons
const startIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    font-size: 32px; 
    transform: translateY(-50%);
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  ">📍</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

const endIcon = L.divIcon({
  className: 'custom-marker',
  html: `<div style="
    font-size: 32px; 
    transform: translateY(-50%);
    filter: drop-shadow(0 2px 4px rgba(0,0,0,0.3));
  ">🏠</div>`,
  iconSize: [32, 32],
  iconAnchor: [16, 32],
});

// Routing Control Component
const RoutingControl = ({ userLocation, propertyLocation, travelMode, onRouteFound }) => {
  const map = useMap();
  const routingControlRef = useRef(null);

  useEffect(() => {
    if (!map || !userLocation || !propertyLocation) return;

    // Remove existing routing control
    if (routingControlRef.current) {
      map.removeControl(routingControlRef.current);
    }

    // Create routing control
    routingControlRef.current = L.Routing.control({
      waypoints: [
        L.latLng(userLocation[0], userLocation[1]),
        L.latLng(propertyLocation[0], propertyLocation[1])
      ],
      routeWhileDragging: true,
      addWaypoints: true,
      draggableWaypoints: true,
      fitSelectedRoutes: true,
      showAlternatives: true,
      altLineOptions: {
        styles: [
          { color: '#9E9E9E', opacity: 0.4, weight: 4 }
        ]
      },
      lineOptions: {
        styles: [
          { color: '#00BFA5', opacity: 0.8, weight: 6 }
        ]
      },
      createMarker: function(i, waypoint, n) {
        return L.marker(waypoint.latLng, {
          icon: i === 0 ? startIcon : endIcon,
          draggable: true
        });
      },
      router: L.Routing.osrmv1({
        serviceUrl: `https://router.project-osrm.org/route/v1/${travelMode}`,
        profile: travelMode
      })
    }).addTo(map);

    // Event listeners
    routingControlRef.current.on('routesfound', function(e) {
      const routes = e.routes;
      const summary = routes[0].summary;
      
      const routeInfo = {
        distance_km: (summary.totalDistance / 1000).toFixed(2),
        duration_min: Math.round(summary.totalTime / 60),
        duration_hours: (summary.totalTime / 3600).toFixed(1)
      };

      console.log('Route found:', routeInfo);
      
      if (onRouteFound) {
        onRouteFound(routeInfo);
      }
    });

    return () => {
      if (routingControlRef.current && map) {
        map.removeControl(routingControlRef.current);
      }
    };
  }, [map, userLocation, propertyLocation, travelMode, onRouteFound]);

  return null;
};

const RoutingMap = ({ 
  propertyLatitude, 
  propertyLongitude,
  propertyTitle,
  propertyAddress,
  height = '500px'
}) => {
  const [userLocation, setUserLocation] = useState(null);
  const [showRouting, setShowRouting] = useState(false);
  const [travelMode, setTravelMode] = useState('driving');
  const [gettingLocation, setGettingLocation] = useState(false);
  const [routeInfo, setRouteInfo] = useState(null);

  const propertyLocation = [
    parseFloat(propertyLatitude),
    parseFloat(propertyLongitude)
  ];

  const handleGetDirections = () => {
    if (userLocation) {
      setShowRouting(true);
      return;
    }

    setGettingLocation(true);
    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          setUserLocation([
            position.coords.latitude,
            position.coords.longitude
          ]);
          setShowRouting(true);
          setGettingLocation(false);
        },
        (error) => {
          console.error('Location error:', error);
          alert('Unable to get your location. Please enable location services.');
          setGettingLocation(false);
        },
        {
          enableHighAccuracy: true,
          timeout: 10000,
          maximumAge: 0
        }
      );
    } else {
      alert('Geolocation is not supported by your browser');
      setGettingLocation(false);
    }
  };

  const handleClearRoute = () => {
    setShowRouting(false);
    setUserLocation(null);
    setRouteInfo(null);
  };

  return (
    <div style={{ position: 'relative' }}>
      {/* Control Panel */}
      <div style={{
        position: 'absolute',
        top: '10px',
        left: '10px',
        zIndex: 1000,
        background: 'white',
        padding: '15px',
        borderRadius: '12px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        minWidth: '280px',
        maxWidth: '320px'
      }}>
        <div style={{ 
          marginBottom: '12px', 
          fontWeight: 'bold',
          fontSize: '16px',
          color: '#333',
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          🗺️ Navigation
        </div>

        {!showRouting ? (
          <button
            onClick={handleGetDirections}
            disabled={gettingLocation}
            style={{
              width: '100%',
              padding: '12px',
              background: gettingLocation ? '#ccc' : '#00BFA5',
              color: 'white',
              border: 'none',
              borderRadius: '8px',
              cursor: gettingLocation ? 'wait' : 'pointer',
              fontWeight: 'bold',
              fontSize: '14px',
              transition: 'background 0.3s',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}
            onMouseEnter={(e) => {
              if (!gettingLocation) e.target.style.background = '#00AB8E';
            }}
            onMouseLeave={(e) => {
              if (!gettingLocation) e.target.style.background = '#00BFA5';
            }}
          >
            {gettingLocation ? '⏳ Getting location...' : '🧭 Get Directions'}
          </button>
        ) : (
          <div>
            {/* Route Info Display */}
            {routeInfo && (
              <div style={{
                background: '#E8F5E9',
                padding: '12px',
                borderRadius: '8px',
                marginBottom: '12px',
                border: '2px solid #4CAF50'
              }}>
                <div style={{ 
                  fontSize: '12px', 
                  color: '#2E7D32',
                  fontWeight: 'bold',
                  marginBottom: '6px'
                }}>
                  ✅ Route Calculated
                </div>
                <div style={{ fontSize: '14px', color: '#1B5E20' }}>
                  <strong>📏 Distance:</strong> {routeInfo.distance_km} km
                </div>
                <div style={{ fontSize: '14px', color: '#1B5E20' }}>
                  <strong>⏱️ Duration:</strong> {routeInfo.duration_min} min
                </div>
              </div>
            )}

            <div style={{ marginBottom: '10px', fontSize: '14px', fontWeight: '600', color: '#555' }}>
              Travel Mode:
            </div>
            <div style={{ display: 'flex', gap: '8px', marginBottom: '12px' }}>
              {[
                { mode: 'driving', icon: '🚗', label: 'Drive' },
                { mode: 'walking', icon: '🚶', label: 'Walk' },
                { mode: 'cycling', icon: '🚴', label: 'Cycle' }
              ].map(({ mode, icon, label }) => (
                <button
                  key={mode}
                  onClick={() => setTravelMode(mode)}
                  style={{
                    flex: 1,
                    padding: '10px 8px',
                    background: travelMode === mode ? '#00BFA5' : 'white',
                    color: travelMode === mode ? 'white' : '#333',
                    border: `2px solid ${travelMode === mode ? '#00BFA5' : '#ddd'}`,
                    borderRadius: '8px',
                    cursor: 'pointer',
                    fontSize: '20px',
                    transition: 'all 0.3s',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: '4px'
                  }}
                  title={label}
                >
                  <span>{icon}</span>
                  <span style={{ fontSize: '10px', fontWeight: 'bold' }}>{label}</span>
                </button>
              ))}
            </div>

            <button
              onClick={handleClearRoute}
              style={{
                width: '100%',
                padding: '10px',
                background: '#f44336',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: 'pointer',
                fontSize: '13px',
                fontWeight: 'bold',
                transition: 'background 0.3s'
              }}
              onMouseEnter={(e) => e.target.style.background = '#d32f2f'}
              onMouseLeave={(e) => e.target.style.background = '#f44336'}
            >
              ✖️ Clear Route
            </button>
          </div>
        )}
      </div>

      {/* Map Container */}
      <div style={{ 
        height, 
        width: '100%', 
        borderRadius: '12px', 
        overflow: 'hidden',
        boxShadow: '0 4px 12px rgba(0,0,0,0.1)'
      }}>
        <MapContainer
          center={propertyLocation}
          zoom={14}
          style={{ height: '100%', width: '100%' }}
          scrollWheelZoom={true}
        >
          <TileLayer
            attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          />

          {/* Property Marker */}
          <Marker position={propertyLocation}>
            <Popup>
              <div style={{ padding: '8px', minWidth: '200px' }}>
                <strong style={{ color: '#00BFA5', fontSize: '14px', display: 'block', marginBottom: '6px' }}>
                  {propertyTitle}
                </strong>
                <p style={{ margin: '0', fontSize: '12px', color: '#666' }}>
                  📍 {propertyAddress}
                </p>
              </div>
            </Popup>
          </Marker>

          {/* Routing Control */}
          {showRouting && userLocation && (
            <RoutingControl
              userLocation={userLocation}
              propertyLocation={propertyLocation}
              travelMode={travelMode}
              onRouteFound={setRouteInfo}
            />
          )}
        </MapContainer>
      </div>

      {/* Legend */}
      <div style={{
        position: 'absolute',
        bottom: '15px',
        right: '15px',
        zIndex: 1000,
        background: 'white',
        padding: '12px',
        borderRadius: '8px',
        boxShadow: '0 4px 12px rgba(0,0,0,0.15)',
        fontSize: '12px'
      }}>
        <div style={{ fontWeight: 'bold', marginBottom: '6px', color: '#333' }}>Legend</div>
        <div style={{ marginBottom: '3px' }}>📍 Your Location</div>
        <div style={{ marginBottom: '3px' }}>🏠 Property</div>
        <div style={{ color: '#00BFA5', fontWeight: 'bold' }}>━━ Primary Route</div>
        <div style={{ color: '#9E9E9E' }}>━━ Alternative</div>
      </div>
    </div>
  );
};

export default RoutingMap;