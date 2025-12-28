import React, { useLayoutEffect, useRef, useState } from 'react';

const MapView = ({ 
  latitude, 
  longitude, 
  propertyTitle = 'Property Location',
  address = '',
  height = '500px',
  showControls = true,
  showLegend = true
}) => {
  const mapContainerRef = useRef(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useLayoutEffect(() => {
    if (!latitude || !longitude) {
      setError('No coordinates provided');
      setLoading(false);
      return;
    }

    const lat = parseFloat(latitude);
    const lng = parseFloat(longitude);

    if (isNaN(lat) || isNaN(lng)) {
      setError('Invalid coordinates');
      setLoading(false);
      return;
    }

    const initMap = async () => {
      try {
        const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
        
        if (!apiKey) {
          throw new Error('Add VITE_GOOGLE_MAPS_API_KEY to .env file');
        }

        // Load Google Maps
        if (!window.google?.maps) {
          await loadGoogleMaps(apiKey);
        }

        if (!mapContainerRef.current) {
          throw new Error('Map container not found');
        }

        // Create map
        const map = new google.maps.Map(mapContainerRef.current, {
          center: { lat, lng },
          zoom: 15,
          mapTypeId: 'roadmap',
          zoomControl: true,
          streetViewControl: true,
          fullscreenControl: true,
          mapTypeControl: true,
        });

        // Add property marker
        const marker = new google.maps.Marker({
          position: { lat, lng },
          map: map,
          title: propertyTitle,
          icon: {
            path: google.maps.SymbolPath.CIRCLE,
            scale: 12,
            fillColor: '#FF0000',
            fillOpacity: 1,
            strokeColor: '#FFFFFF',
            strokeWeight: 3,
          },
          animation: google.maps.Animation.DROP,
        });

        // Info window
        const infoWindow = new google.maps.InfoWindow({
          content: `
            <div style="padding: 14px; font-family: Arial, sans-serif; max-width: 280px;">
              <h3 style="margin: 0 0 10px 0; font-size: 17px; font-weight: 600; color: #1a1a1a;">
                ${propertyTitle}
              </h3>
              ${address ? `
                <p style="margin: 0 0 10px 0; font-size: 14px; color: #666; line-height: 1.4;">
                  📍 ${address}
                </p>
              ` : ''}
              <p style="margin: 0; font-size: 12px; color: #999; font-family: monospace;">
                ${lat.toFixed(6)}, ${lng.toFixed(6)}
              </p>
              <div style="margin-top: 12px; padding-top: 12px; border-top: 1px solid #eee;">
                <a href="https://www.google.com/maps/dir/?api=1&destination=${lat},${lng}" 
                   target="_blank" 
                   style="color: #1a73e8; text-decoration: none; font-size: 13px; font-weight: 500;">
                  🚗 Get Directions
                </a>
              </div>
            </div>
          `,
        });

        infoWindow.open(map, marker);
        
        marker.addListener('click', () => {
          infoWindow.open(map, marker);
        });

        setLoading(false);

      } catch (err) {
        console.error('Map error:', err);
        setError(err.message);
        setLoading(false);
      }
    };

    const timer = setTimeout(initMap, 100);
    return () => clearTimeout(timer);

  }, [latitude, longitude, propertyTitle, address]);

  const loadGoogleMaps = (apiKey) => {
    return new Promise((resolve, reject) => {
      if (window.google?.maps) {
        resolve();
        return;
      }

      const existing = document.querySelector('script[src*="maps.googleapis.com"]');
      if (existing) {
        const check = setInterval(() => {
          if (window.google?.maps) {
            clearInterval(check);
            resolve();
          }
        }, 100);
        setTimeout(() => {
          clearInterval(check);
          reject(new Error('Timeout'));
        }, 10000);
        return;
      }

      const script = document.createElement('script');
      script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}`;
      script.async = true;
      script.onload = () => resolve();
      script.onerror = () => reject(new Error('Failed to load Google Maps'));
      document.head.appendChild(script);
    });
  };

  if (error) {
    return (
      <div className="bg-white rounded-xl shadow-lg overflow-hidden" style={{ height }}>
        <div className="flex flex-col items-center justify-center h-full bg-red-50 p-8">
          <div className="text-center max-w-xl">
            <div className="text-5xl mb-4">❌</div>
            <h3 className="text-xl font-bold text-red-800 mb-2">Map Error</h3>
            <p className="text-red-600 mb-4">{error}</p>
            <div className="bg-white rounded-lg p-4 text-left text-sm">
              <p className="font-bold mb-2">Setup Instructions:</p>
              <ol className="list-decimal pl-5 space-y-1">
                <li>Create <code className="bg-gray-100 px-2 py-1 rounded">.env</code> file in project root</li>
                <li>Add: <code className="bg-gray-100 px-2 py-1 rounded text-xs">VITE_GOOGLE_MAPS_API_KEY=your_key</code></li>
                <li>Get API key from <a href="https://console.cloud.google.com" target="_blank" className="text-blue-600">Google Cloud Console</a></li>
                <li>Restart server: <code className="bg-gray-100 px-2 py-1 rounded">npm run dev</code></li>
              </ol>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg overflow-hidden border relative" style={{ height }}>
      {loading && (
        <div className="absolute inset-0 flex items-center justify-center bg-gradient-to-br from-blue-50 to-gray-50 z-10">
          <div className="text-center">
            <div className="w-16 h-16 border-4 border-blue-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
            <p className="text-sm font-medium text-gray-700">Loading map...</p>
            <p className="text-xs text-gray-500 mt-2">Initializing Google Maps</p>
          </div>
        </div>
      )}
      
      {showControls && (
        <div className="absolute top-0 left-0 right-0 p-4 bg-white/95 backdrop-blur-sm border-b z-20 shadow-sm">
          <div className="flex justify-between items-center">
            <div className="flex-1">
              <h3 className="font-bold text-lg text-gray-900">{propertyTitle}</h3>
              {address && <p className="text-sm text-gray-600 mt-1">📍 {address}</p>}
            </div>
            <button
              onClick={() => window.open(`https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`, '_blank')}
              className="px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors flex items-center gap-2"
            >
              <span>🗺️</span>
              <span>Open in Google Maps</span>
            </button>
          </div>
        </div>
      )}
      
      <div 
        ref={mapContainerRef}
        className="w-full h-full"
        style={{ paddingTop: showControls ? '100px' : '0' }}
      />

      {showLegend && (
        <div className="absolute bottom-0 left-0 right-0 p-3 bg-white/95 backdrop-blur-sm border-t z-20 shadow-sm">
          <div className="flex items-center gap-3 text-sm">
            <div className="flex items-center gap-2">
              <div className="w-4 h-4 bg-red-500 rounded-full shadow-sm"></div>
              <span className="font-medium text-gray-700">Property Location</span>
            </div>
            <div className="text-gray-500 ml-auto font-mono text-xs">
              {parseFloat(latitude).toFixed(6)}, {parseFloat(longitude).toFixed(6)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default MapView;