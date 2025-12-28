import React, { useState, useEffect, useRef } from 'react';
import { MapContainer, TileLayer, Marker, Popup, Circle, useMapEvents } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Fix for default markers in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

const LocationMarker = ({ position, setPosition }) => {
    const map = useMapEvents({
        click(e) {
            setPosition(e.latlng);
            map.flyTo(e.latlng, map.getZoom());
        },
    });

    return position === null ? null : (
        <Marker position={position}>
            <Popup>Search around this location</Popup>
        </Marker>
    );
};

const EnhancedPropertySearch = () => {
    const [mapCenter, setMapCenter] = useState([27.7172, 85.3240]); // Kathmandu default
    const [userLocation, setUserLocation] = useState(null);
    const [searchRadius, setSearchRadius] = useState(5); // km
    const [nearbyPlaces, setNearbyPlaces] = useState([]);
    const [properties, setProperties] = useState([]);
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        minPrice: '',
        maxPrice: '',
        bedrooms: '',
        propertyType: '',
        furnishing: '',
        amenities: [],
        sortBy: 'distance'
    });

    const mapRef = useRef();

    // Get user's current location
    useEffect(() => {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const { latitude, longitude } = position.coords;
                    setUserLocation([latitude, longitude]);
                    setMapCenter([latitude, longitude]);
                    fetchNearbyProperties(latitude, longitude);
                    fetchNearbyPlaces(latitude, longitude);
                },
                (error) => {
                    console.log('Location access denied:', error);
                    // Use default location
                    fetchNearbyProperties(mapCenter[0], mapCenter[1]);
                    fetchNearbyPlaces(mapCenter[0], mapCenter[1]);
                }
            );
        }
    }, []);

    const fetchNearbyProperties = async (lat, lng) => {
        setLoading(true);
        try {
            const params = new URLSearchParams({
                lat,
                lng,
                radius: searchRadius,
                ...filters
            });
            
            const response = await fetch(`/api/properties/nearby?${params}`);
            const data = await response.json();
            setProperties(data.properties || []);
        } catch (error) {
            console.error('Error fetching properties:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchNearbyPlaces = async (lat, lng) => {
        try {
            const response = await fetch(`/api/maps/nearby-places?lat=${lat}&lng=${lng}`);
            const data = await response.json();
            setNearbyPlaces(data.places || []);
        } catch (error) {
            console.error('Error fetching nearby places:', error);
        }
    };

    const handleMapClick = (latlng) => {
        setMapCenter([latlng.lat, latlng.lng]);
        fetchNearbyProperties(latlng.lat, latlng.lng);
        fetchNearbyPlaces(latlng.lat, latlng.lng);
    };

    const handleFilterChange = (key, value) => {
        const newFilters = { ...filters, [key]: value };
        setFilters(newFilters);
        
        if (userLocation) {
            fetchNearbyProperties(userLocation[0], userLocation[1]);
        }
    };

    const handleUseMyLocation = () => {
        if (userLocation) {
            setMapCenter(userLocation);
            if (mapRef.current) {
                mapRef.current.flyTo(userLocation, 13);
            }
            fetchNearbyProperties(userLocation[0], userLocation[1]);
            fetchNearbyPlaces(userLocation[0], userLocation[1]);
        }
    };

    const propertyTypes = ['apartment', 'house', 'room', 'studio', 'commercial'];
    const furnishingOptions = ['furnished', 'semi-furnished', 'unfurnished'];
    const amenitiesList = ['wifi', 'parking', 'water', 'kitchen', 'ac', 'laundry', 'security', 'pool', 'gym'];

    return (
        <div className="flex flex-col lg:flex-row gap-6 p-4">
            {/* Filters Sidebar */}
            <div className="lg:w-1/4 space-y-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <h3 className="font-bold text-lg mb-4">Search Filters</h3>
                    
                    {/* Location */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Search Radius: {searchRadius} km
                        </label>
                        <input
                            type="range"
                            min="1"
                            max="50"
                            value={searchRadius}
                            onChange={(e) => {
                                setSearchRadius(parseInt(e.target.value));
                                if (userLocation) {
                                    fetchNearbyProperties(userLocation[0], userLocation[1]);
                                }
                            }}
                            className="w-full"
                        />
                        <div className="flex justify-between text-xs text-gray-500">
                            <span>1 km</span>
                            <span>50 km</span>
                        </div>
                    </div>

                    {/* Price Range */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Price Range (per month)
                        </label>
                        <div className="flex gap-2">
                            <input
                                type="number"
                                placeholder="Min"
                                className="w-1/2 px-3 py-2 border border-gray-300 rounded"
                                value={filters.minPrice}
                                onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                            />
                            <input
                                type="number"
                                placeholder="Max"
                                className="w-1/2 px-3 py-2 border border-gray-300 rounded"
                                value={filters.maxPrice}
                                onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Property Type */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Property Type
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            value={filters.propertyType}
                            onChange={(e) => handleFilterChange('propertyType', e.target.value)}
                        >
                            <option value="">All Types</option>
                            {propertyTypes.map(type => (
                                <option key={type} value={type}>
                                    {type.charAt(0).toUpperCase() + type.slice(1)}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Bedrooms */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Bedrooms
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            value={filters.bedrooms}
                            onChange={(e) => handleFilterChange('bedrooms', e.target.value)}
                        >
                            <option value="">Any</option>
                            <option value="1">1</option>
                            <option value="2">2</option>
                            <option value="3">3</option>
                            <option value="4">4+</option>
                        </select>
                    </div>

                    {/* Furnishing */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Furnishing
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            value={filters.furnishing}
                            onChange={(e) => handleFilterChange('furnishing', e.target.value)}
                        >
                            <option value="">Any</option>
                            {furnishingOptions.map(option => (
                                <option key={option} value={option}>
                                    {option.split('-').map(word => 
                                        word.charAt(0).toUpperCase() + word.slice(1)
                                    ).join(' ')}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Sort By */}
                    <div className="mb-4">
                        <label className="block text-sm font-medium text-gray-700 mb-2">
                            Sort By
                        </label>
                        <select
                            className="w-full px-3 py-2 border border-gray-300 rounded"
                            value={filters.sortBy}
                            onChange={(e) => handleFilterChange('sortBy', e.target.value)}
                        >
                            <option value="distance">Distance (Nearest)</option>
                            <option value="price_low">Price (Low to High)</option>
                            <option value="price_high">Price (High to Low)</option>
                            <option value="newest">Newest</option>
                            <option value="rating">Highest Rated</option>
                        </select>
                    </div>

                    {/* Location Button */}
                    <button
                        onClick={handleUseMyLocation}
                        className="w-full px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                    >
                        📍 Use My Location
                    </button>
                </div>

                {/* Nearby Places */}
                {nearbyPlaces.length > 0 && (
                    <div className="bg-white rounded-lg shadow p-6">
                        <h3 className="font-bold text-lg mb-4">Nearby Places</h3>
                        <div className="space-y-3">
                            {nearbyPlaces.map((place, index) => (
                                <div key={index} className="flex items-center gap-3 p-2 hover:bg-gray-50 rounded">
                                    <div className={`p-2 rounded ${
                                        place.type === 'school' ? 'bg-blue-100 text-blue-600' :
                                        place.type === 'hospital' ? 'bg-red-100 text-red-600' :
                                        'bg-gray-100 text-gray-600'
                                    }`}>
                                        {place.type === 'school' ? '🏫' :
                                         place.type === 'hospital' ? '🏥' : '📍'}
                                    </div>
                                    <div className="flex-1">
                                        <div className="font-medium">{place.name}</div>
                                        <div className="text-sm text-gray-500">{place.address}</div>
                                        <div className="text-xs text-gray-400">{place.distance?.toFixed(1)} km away</div>
                                    </div>
                                    {place.rating && (
                                        <div className="text-sm">
                                            ⭐ {place.rating}
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* Map and Results */}
            <div className="lg:w-3/4">
                {/* Map */}
                <div className="bg-white rounded-lg shadow p-4 mb-6">
                    <div className="h-96 rounded-lg overflow-hidden">
                        <MapContainer
                            center={mapCenter}
                            zoom={13}
                            className="h-full w-full"
                            whenCreated={mapInstance => { mapRef.current = mapInstance; }}
                        >
                            <TileLayer
                                url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                                attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                            />
                            
                            {/* Search Radius Circle */}
                            <Circle
                                center={mapCenter}
                                radius={searchRadius * 1000}
                                pathOptions={{ color: 'blue', fillColor: 'blue', fillOpacity: 0.1 }}
                            />
                            
                            {/* User Location Marker */}
                            {userLocation && (
                                <Marker position={userLocation}>
                                    <Popup>Your Location</Popup>
                                </Marker>
                            )}
                            
                            {/* Property Markers */}
                            {properties.map(property => (
                                <Marker 
                                    key={property.id} 
                                    position={[property.latitude, property.longitude]}
                                >
                                    <Popup>
                                        <div className="p-2">
                                            <h4 className="font-bold">{property.title}</h4>
                                            <p className="text-sm text-gray-600">{property.address}</p>
                                            <p className="font-bold text-green-600">${property.price}/month</p>
                                            <button 
                                                className="mt-2 w-full bg-blue-600 text-white py-1 px-2 rounded text-sm hover:bg-blue-700"
                                                onClick={() => window.location.href = `/properties/${property.id}`}
                                            >
                                                View Details
                                            </button>
                                        </div>
                                    </Popup>
                                </Marker>
                            ))}
                            
                            {/* Click to set location */}
                            <LocationMarker 
                                position={mapCenter} 
                                setPosition={(latlng) => handleMapClick(latlng)}
                            />
                        </MapContainer>
                    </div>
                </div>

                {/* Results */}
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex justify-between items-center mb-6">
                        <h3 className="text-xl font-bold">
                            {loading ? 'Searching...' : `${properties.length} Properties Found`}
                        </h3>
                        <div className="text-sm text-gray-600">
                            Showing properties within {searchRadius} km radius
                        </div>
                    </div>

                    {loading ? (
                        <div className="text-center py-12">
                            <div className="inline-block animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
                            <p className="mt-4">Loading properties...</p>
                        </div>
                    ) : properties.length === 0 ? (
                        <div className="text-center py-12">
                            <div className="text-4xl mb-4">🏠</div>
                            <h3 className="text-xl font-bold mb-2">No properties found</h3>
                            <p className="text-gray-600">Try adjusting your search filters or location</p>
                            <button
                                onClick={handleUseMyLocation}
                                className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                            >
                                Search Near Me
                            </button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {properties.map(property => (
                                <div key={property.id} className="border rounded-lg overflow-hidden hover:shadow-lg transition-shadow">
                                    {property.primary_image && (
                                        <img 
                                            src={property.primary_image} 
                                            alt={property.title}
                                            className="w-full h-48 object-cover"
                                        />
                                    )}
                                    <div className="p-4">
                                        <div className="flex justify-between items-start mb-2">
                                            <h4 className="font-bold">{property.title}</h4>
                                            <span className="font-bold text-green-600">${property.price}</span>
                                        </div>
                                        <p className="text-sm text-gray-600 mb-3">{property.address}</p>
                                        
                                        <div className="flex items-center gap-4 text-sm text-gray-500 mb-3">
                                            <span>🛏️ {property.bedrooms} bed</span>
                                            <span>🚿 {property.bathrooms} bath</span>
                                            <span>📐 {property.area_sqft} sqft</span>
                                        </div>
                                        
                                        {property.distance && (
                                            <div className="text-sm text-gray-500 mb-3">
                                                📍 {property.distance.toFixed(1)} km away
                                            </div>
                                        )}
                                        
                                        <button 
                                            className="w-full mt-2 bg-blue-600 text-white py-2 rounded hover:bg-blue-700"
                                            onClick={() => window.location.href = `/properties/${property.id}`}
                                        >
                                            View Details
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default EnhancedPropertySearch;