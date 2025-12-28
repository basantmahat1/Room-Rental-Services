import React from 'react';
import { Link } from 'react-router-dom';
import { MapPin, Bed, Bath, Maximize2 } from 'lucide-react';

export default function PropertyCard({ property }) {
  if (!property) return null;

  const {
    id,
    title,
    property_type,
    price,
    area,
    rooms = 0,
    bathrooms = 0,
    location_name,
    featured_image,
    images,
    latitude,
    longitude,
  } = property;

  // Get the featured image or first image
  let imageUrl = featured_image;
  if (!imageUrl && images) {
    try {
      const imageArray = typeof images === 'string' ? JSON.parse(images) : images;
      imageUrl = Array.isArray(imageArray) ? imageArray[0] : null;
    } catch (e) {
      imageUrl = null;
    }
  }

  const defaultImage = 'https://via.placeholder.com/300x200?text=No+Image';
  const displayImage = imageUrl || defaultImage;

  return (
    <div className="bg-white rounded-lg shadow-md hover:shadow-xl transition-shadow overflow-hidden group">
      {/* Image Container */}
      <div className="relative overflow-hidden h-48 bg-gray-200">
        <img
          src={displayImage}
          alt={title}
          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-300"
        />
        <div className="absolute top-3 right-3 bg-blue-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
          {property_type === 'rent' ? 'Rent' : 'Sale'}
        </div>
      </div>

      {/* Content */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-lg font-bold text-gray-800 mb-2 line-clamp-2 hover:text-blue-600">
          <Link to={`/properties/${id}`}>{title}</Link>
        </h3>

        {/* Price */}
        <div className="text-2xl font-bold text-green-600 mb-3">
          Rs. {price ? price.toLocaleString() : '0'}
        </div>

        {/* Location */}
        <div className="flex items-center text-gray-600 mb-4 text-sm">
          <MapPin size={16} className="mr-1" />
          <span className="truncate">{location_name || 'Location not specified'}</span>
        </div>

        {/* Specs */}
        <div className="grid grid-cols-3 gap-2 mb-4 text-center">
          {rooms > 0 && (
            <div>
              <div className="flex items-center justify-center mb-1">
                <Bed size={18} className="text-gray-600" />
              </div>
              <span className="text-xs text-gray-600">{rooms} Beds</span>
            </div>
          )}
          {bathrooms > 0 && (
            <div>
              <div className="flex items-center justify-center mb-1">
                <Bath size={18} className="text-gray-600" />
              </div>
              <span className="text-xs text-gray-600">{bathrooms} Baths</span>
            </div>
          )}
          {area && (
            <div>
              <div className="flex items-center justify-center mb-1">
                <Maximize2 size={18} className="text-gray-600" />
              </div>
              <span className="text-xs text-gray-600">{area} sq ft</span>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-2 gap-2">
          <Link
            to={`/properties/${id}`}
            className="px-3 py-2 bg-blue-500 text-white rounded-lg text-sm font-medium text-center hover:bg-blue-600 transition"
          >
            View Details
          </Link>
          <Link
            to={`/properties/${id}?view=map`}
            className="px-3 py-2 bg-green-500 text-white rounded-lg text-sm font-medium text-center hover:bg-green-600 transition"
          >
            View Map
          </Link>
        </div>
      </div>
    </div>
  );
}
