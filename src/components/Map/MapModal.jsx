import React, { useState, useEffect, useRef } from 'react';

const MapModal = ({ 
  showMapModal, 
  onClose, 
  formData, 
  onLocationSelect,
  selectedLocation: externalSelectedLocation,
  setSelectedLocation: externalSetSelectedLocation 
}) => {
  const [mapScriptLoaded, setMapScriptLoaded] = useState(false);
  const [isMapInitializing, setIsMapInitializing] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [isSearching, setIsSearching] = useState(false);
  const [selectedLocation, setSelectedLocation] = useState(externalSelectedLocation);

  const mapContainerRef = useRef(null);
  const mapInstanceRef = useRef(null);
  const markerRef = useRef(null);
  const autocompleteServiceRef = useRef(null);
  const placesServiceRef = useRef(null);

  // Sync external selected location
  useEffect(() => {
    setSelectedLocation(externalSelectedLocation);
  }, [externalSelectedLocation]);

  // Load Google Maps script when modal opens
  useEffect(() => {
    if (showMapModal) {
      loadGoogleMapsScript();
    } else {
      cleanupMap();
    }
  }, [showMapModal]);

  const loadGoogleMapsScript = () => {
    if (window.google?.maps) {
      initializeMap();
      return;
    }

    if (document.getElementById('google-maps-script')) {
      return;
    }

    const apiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      console.error('Google Maps API key missing');
      return;
    }

    const script = document.createElement('script');
    script.id = 'google-maps-script';
    script.src = `https://maps.googleapis.com/maps/api/js?key=${apiKey}&libraries=places`;
    script.async = true;
    script.defer = true;
    script.onload = () => initializeMap();
    script.onerror = () => console.error('Failed to load Google Maps');
    document.head.appendChild(script);
  };

  const initializeMap = () => {
    if (!window.google || !window.google.maps) {
      console.error('Google Maps not loaded');
      return;
    }

    if (!mapContainerRef.current) return;

    setIsMapInitializing(true);

    try {
      const defaultCenter = formData.latitude && formData.longitude
        ? { lat: parseFloat(formData.latitude), lng: parseFloat(formData.longitude) }
        : { lat: 27.7172, lng: 85.3240 };

      const map = new google.maps.Map(mapContainerRef.current, {
        center: defaultCenter,
        zoom: 14,
        mapTypeId: 'roadmap',
        streetViewControl: true,
        fullscreenControl: true,
        zoomControl: true,
        mapTypeControl: true,
      });

      mapInstanceRef.current = map;

      google.maps.importLibrary("places").then((placesLibrary) => {
        autocompleteServiceRef.current = new google.maps.places.AutocompleteService();
        placesServiceRef.current = new google.maps.places.PlacesService(map);
      }).catch((error) => {
        console.error('Failed to load Places library:', error);
      });

      if (formData.latitude && formData.longitude) {
        addMarker(defaultCenter, map);
        setSelectedLocation(defaultCenter);
      }

      map.addListener('click', async (event) => {
        const clickedLocation = {
          lat: event.latLng.lat(),
          lng: event.latLng.lng()
        };
        addMarker(clickedLocation, map);
        setSelectedLocation(clickedLocation);
        externalSetSelectedLocation(clickedLocation);
        
        reverseGeocode(clickedLocation);
      });

      setIsMapInitializing(false);
      setMapScriptLoaded(true);
    } catch (error) {
      console.error('Error initializing map:', error);
      setIsMapInitializing(false);
    }
  };

  const addMarker = (location, map) => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
    }

    markerRef.current = new google.maps.Marker({
      position: location,
      map: map,
      draggable: true,
      animation: google.maps.Animation.DROP,
      title: 'Drag to adjust location'
    });

    markerRef.current.addListener('dragend', (event) => {
      const draggedLocation = {
        lat: event.latLng.lat(),
        lng: event.latLng.lng()
      };
      setSelectedLocation(draggedLocation);
      externalSetSelectedLocation(draggedLocation);
      
      reverseGeocode(draggedLocation);
    });

    map.setCenter(location);
    map.setZoom(16);
  };

  const handleSearchChange = (e) => {
    setSearchQuery(e.target.value);
    if (e.target.value.length > 2) {
      performSearch(e.target.value);
    } else {
      setSearchResults([]);
    }
  };

  const performSearch = (query) => {
    if (!autocompleteServiceRef.current) return;

    setIsSearching(true);

    const request = {
      input: query + (query.toLowerCase().includes('nepal') ? '' : ', Nepal'),
      componentRestrictions: { country: 'np' },
      types: ['geocode', 'establishment']
    };

    autocompleteServiceRef.current.getPlacePredictions(
      request,
      (predictions, status) => {
        setIsSearching(false);
        if (status === google.maps.places.PlacesServiceStatus.OK && predictions) {
          setSearchResults(predictions);
        } else {
          setSearchResults([]);
        }
      }
    );
  };

  const handleSearchSelect = (place) => {
    setSearchQuery(place.description);
    setSearchResults([]);

    if (!placesServiceRef.current) return;

    const request = {
      placeId: place.place_id,
      fields: ['geometry', 'formatted_address', 'address_components', 'name', 'vicinity', 'plus_code']
    };

    placesServiceRef.current.getDetails(request, (placeResult, status) => {
      if (status === google.maps.places.PlacesServiceStatus.OK && placeResult) {
        const location = {
          lat: placeResult.geometry.location.lat(),
          lng: placeResult.geometry.location.lng()
        };

        if (mapInstanceRef.current) {
          mapInstanceRef.current.setCenter(location);
          mapInstanceRef.current.setZoom(16);
          addMarker(location, mapInstanceRef.current);
          setSelectedLocation(location);
          externalSetSelectedLocation(location);
        }

        updateAddressFromPlace(placeResult);
      }
    });
  };

  const updateAddressFromPlace = (place) => {
    let streetNumber = '';
    let streetName = '';
    let locality = '';
    let city = '';
    let district = '';
    let state = '';
    let country = 'Nepal';
    let postalCode = '';

    if (place.address_components) {
      place.address_components.forEach(component => {
        const types = component.types;
        const longName = component.long_name;

        if (types.includes('street_number')) {
          streetNumber = longName;
        } else if (types.includes('route')) {
          streetName = longName;
        } else if (types.includes('sublocality') || types.includes('sublocality_level_1')) {
          locality = longName;
        } else if (types.includes('locality')) {
          city = longName;
        } else if (types.includes('administrative_area_level_2')) {
          district = longName;
        } else if (types.includes('administrative_area_level_1')) {
          state = longName;
        } else if (types.includes('country')) {
          country = longName;
        } else if (types.includes('postal_code')) {
          postalCode = longName;
        } else if (types.includes('neighborhood')) {
          if (!locality) locality = longName;
        }
      });
    }

    let streetAddress = '';
    if (streetNumber && streetName) {
      streetAddress = `${streetNumber} ${streetName}`;
    } else if (streetNumber) {
      streetAddress = streetNumber;
    } else if (streetName) {
      streetAddress = streetName;
    } else if (place.name && place.name !== place.formatted_address) {
      streetAddress = place.name;
    } else if (place.vicinity) {
      streetAddress = place.vicinity;
    }

    let finalCity = city || district || locality || '';

    if (state && state.includes('Province')) {
      state = state.replace(' Province', ' Province');
    }

    if (!state && finalCity) {
      const provinceMap = {
        'Kathmandu': 'Bagmati Province',
        'Lalitpur': 'Bagmati Province',
        'Bhaktapur': 'Bagmati Province',
        'Pokhara': 'Gandaki Province',
        'Butwal': 'Lumbini Province',
        'Biratnagar': 'Koshi Province',
        'Janakpur': 'Madhesh Province'
      };
      if (provinceMap[finalCity]) {
        state = provinceMap[finalCity];
      }
    }

    onLocationSelect({
      address: streetAddress,
      city: finalCity,
      state: state,
      country: country,
      postal_code: postalCode,
      latitude: selectedLocation?.lat.toString(),
      longitude: selectedLocation?.lng.toString()
    });
  };

  const reverseGeocode = (location) => {
    if (!window.google || !window.google.maps) return;

    const geocoder = new google.maps.Geocoder();
    geocoder.geocode({ location }, (results, status) => {
      if (status === 'OK' && results[0]) {
        updateAddressFromPlace(results[0]);
      }
    });
  };

  const handleUseLocation = () => {
    if (selectedLocation) {
      onLocationSelect({
        latitude: selectedLocation.lat.toString(),
        longitude: selectedLocation.lng.toString()
      });
      onClose();
    }
  };

  const cleanupMap = () => {
    if (markerRef.current) {
      markerRef.current.setMap(null);
      markerRef.current = null;
    }
    if (mapInstanceRef.current) {
      mapInstanceRef.current = null;
    }
    setSearchQuery('');
    setSearchResults([]);
  };

  const closeModal = () => {
    cleanupMap();
    onClose();
  };

  if (!showMapModal) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl w-full max-w-5xl max-h-[90vh] flex flex-col">
        {/* Modal Header */}
        <div className="p-6 border-b flex justify-between items-center bg-gray-50">
          <h3 className="text-2xl font-bold text-gray-900">📍 Select Location on Map</h3>
          <button
            onClick={closeModal}
            className="text-gray-500 hover:text-gray-700 text-3xl"
          >
            ×
          </button>
        </div>
        
        {/* Scrollable Modal Body ONLY */}
        <div className="p-6 flex-grow overflow-y-auto">
          {/* Address Preview in Modal */}
          {(formData.address || formData.city) && (
            <div className="bg-blue-100 border-2 border-blue-300 rounded-xl p-5 mb-6">
              <div className="font-bold text-blue-900 mb-3 text-lg">Auto-filled Address:</div>
              <div className="space-y-2">
                {formData.address && (
                  <div className="flex items-center gap-4">
                    <span className="text-blue-700 w-20 font-medium">Street:</span>
                    <span className="font-bold text-blue-900">{formData.address}</span>
                  </div>
                )}
                {formData.city && (
                  <div className="flex items-center gap-4">
                    <span className="text-blue-700 w-20 font-medium">City:</span>
                    <span className="font-bold text-blue-900">{formData.city}</span>
                  </div>
                )}
                {formData.state && (
                  <div className="flex items-center gap-4">
                    <span className="text-blue-700 w-20 font-medium">Province:</span>
                    <span className="font-bold text-blue-900">{formData.state}</span>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Search Bar */}
          <div className="mb-6">
            <label className="form-label mb-3 text-lg">Search Location in Nepal</label>
            <div className="relative">
              <input
                type="text"
                value={searchQuery}
                onChange={handleSearchChange}
                placeholder="Search places, landmarks, or addresses in Nepal..."
                className="input-ui pl-14 text-lg"
              />
              <div className="absolute left-5 top-4 text-2xl text-gray-500">
                🔍
              </div>
              {isSearching && (
                <div className="absolute right-5 top-4">
                  <div className="animate-spin rounded-full h-7 w-7 border-b-2 border-blue-600"></div>
                </div>
              )}
              
              {/* Search Results Dropdown */}
              {searchResults.length > 0 && (
                <div className="absolute z-10 w-full mt-2 bg-white border-2 border-gray-300 rounded-xl shadow-xl max-h-80 overflow-y-auto">
                  {searchResults.map((place, index) => (
                    <button
                      key={place.place_id}
                      type="button"
                      onClick={() => handleSearchSelect(place)}
                      className="w-full text-left px-5 py-4 hover:bg-blue-50 border-b border-gray-200 last:border-b-0 flex items-start gap-4"
                    >
                      <div className="text-2xl text-gray-400 mt-1">📍</div>
                      <div className="flex-1">
                        <div className="font-bold text-gray-900 text-lg">{place.structured_formatting.main_text}</div>
                        <div className="text-gray-600">{place.structured_formatting.secondary_text}</div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
            <p className="text-gray-500 mt-3">
              Search for places in Nepal or click directly on the map to set location
            </p>
          </div>

          {/* Instructions */}
          <div className="mb-6 grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2">
              <div className="font-medium text-gray-800 mb-3 text-lg">Instructions:</div>
              <div className="bg-blue-50 p-5 rounded-xl">
                <ol className="list-decimal pl-5 space-y-3">
                  <li><span className="font-bold text-blue-900">Type in the search box above</span> to find places</li>
                  <li><span className="font-bold text-blue-900">Click anywhere on the map</span> to place a marker</li>
                  <li><span className="font-bold text-blue-900">Drag the marker</span> to adjust location</li>
                  <li><span className="font-bold text-blue-900">Address will auto-fill</span> when you select location</li>
                  <li>Click "Use This Location" when done</li>
                </ol>
              </div>
            </div>
            <div className="bg-green-50 p-5 rounded-xl">
              <div className="font-bold text-green-900 mb-3 text-lg">Current Selection:</div>
              {selectedLocation ? (
                <div className="space-y-2">
                  <div className="text-lg">
                    <span className="font-medium">Lat:</span> <span className="font-mono font-bold">{selectedLocation.lat.toFixed(6)}</span>
                  </div>
                  <div className="text-lg">
                    <span className="font-medium">Lng:</span> <span className="font-mono font-bold">{selectedLocation.lng.toFixed(6)}</span>
                  </div>
                </div>
              ) : (
                <div className="text-gray-500">No location selected</div>
              )}
            </div>
          </div>

          {/* Map Container */}
          <div className="relative mb-6">
            <div 
              ref={mapContainerRef}
              className="w-full h-[400px] border-2 border-gray-300 rounded-xl overflow-hidden"
            />
            {isMapInitializing && (
              <div className="absolute inset-0 flex items-center justify-center bg-gray-100 rounded-xl">
                <div className="text-center">
                  <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <div className="text-gray-600 text-lg">Loading Google Map...</div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Fixed Action Buttons (Outside Scrollable Area) */}
        <div className="p-6 border-t bg-white">
          <div className="flex flex-col sm:flex-row justify-between items-center gap-4">
            <div className="text-gray-700">
              {selectedLocation 
                ? `Selected: Lat ${selectedLocation.lat.toFixed(6)}, Lng ${selectedLocation.lng.toFixed(6)}`
                : 'Click on map or search to select location'
              }
            </div>
            <div className="flex gap-4">
              <button
                type="button"
                onClick={closeModal}
                className="btn-secondary px-8 py-3 text-lg"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleUseLocation}
                disabled={!selectedLocation}
                className={
                  selectedLocation
                    ? 'btn-primary px-8 py-3 text-lg'
                    : 'btn-primary px-8 py-3 text-lg opacity-50 cursor-not-allowed'
                }
              >
                Use This Location
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MapModal;