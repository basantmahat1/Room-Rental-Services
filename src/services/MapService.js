
// ========================================
// services/mapService.js (NEW)
// ========================================
import { Loader } from '@googlemaps/js-api-loader';

 VITE_GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

let googleMapsLoader = null;

export const mapService = {
  // Initialize Google Maps
  init: async () => {
    if (!googleMapsLoader) {
      googleMapsLoader = new Loader({
        apiKey: VITE_GOOGLE_MAPS_API_KEY,
        version: 'weekly',
        libraries: ['places', 'geometry']
      });
    }
    return await googleMapsLoader.load();
  },

  // Create map instance
  createMap: async (element, options) => {
    const google = await mapService.init();
    return new google.maps.Map(element, options);
  },

  // Create marker
  createMarker: async (map, position, options = {}) => {
    const google = await mapService.init();
    return new google.maps.Marker({
      map,
      position,
      ...options
    });
  },

  // Geocode address
  geocodeAddress: async (address) => {
    const google = await mapService.init();
    const geocoder = new google.maps.Geocoder();
    
    return new Promise((resolve, reject) => {
      geocoder.geocode({ address }, (results, status) => {
        if (status === 'OK' && results[0]) {
          resolve({
            lat: results[0].geometry.location.lat(),
            lng: results[0].geometry.location.lng(),
            formattedAddress: results[0].formatted_address
          });
        } else {
          reject(new Error('Geocoding failed'));
        }
      });
    });
  },

  // Get current location
  getCurrentLocation: () => {
    return new Promise((resolve, reject) => {
      if (!navigator.geolocation) {
        reject(new Error('Geolocation not supported'));
      }

      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            lat: position.coords.latitude,
            lng: position.coords.longitude
          });
        },
        (error) => reject(error)
      );
    });
  },

  // Calculate distance between two points
  calculateDistance: async (from, to) => {
    const google = await mapService.init();
    const distance = google.maps.geometry.spherical.computeDistanceBetween(
      new google.maps.LatLng(from.lat, from.lng),
      new google.maps.LatLng(to.lat, to.lng)
    );
    // Convert meters to kilometers
    return (distance / 1000).toFixed(2);
  },

  // Search nearby places
  searchNearby: async (location, type, radius = 1500) => {
    const google = await mapService.init();
    const service = new google.maps.places.PlacesService(document.createElement('div'));
    
    return new Promise((resolve, reject) => {
      service.nearbySearch(
        {
          location: new google.maps.LatLng(location.lat, location.lng),
          radius,
          type
        },
        (results, status) => {
          if (status === google.maps.places.PlacesServiceStatus.OK) {
            resolve(results);
          } else {
            reject(new Error('Places search failed'));
          }
        }
      );
    });
  }
};

export default mapService;