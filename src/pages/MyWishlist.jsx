// ========================================
// pages/MyWishlist.jsx (NEW - Tenant Wishlist)
// ========================================
import React, { useState, useEffect } from 'react';
import { wishlistAPI } from '../services/api';
import PropertyCard from '../components/PropertyCard';

const MyWishlist = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadWishlist();
  }, []);

  const loadWishlist = async () => {
    try {
      const response = await wishlistAPI.getAll();
      setProperties(response.data.properties);
    } catch (error) {
      console.error('Error loading wishlist:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRemove = async (propertyId) => {
    try {
      await wishlistAPI.remove(propertyId);
      setProperties(properties.filter(p => p.id !== propertyId));
    } catch (error) {
      alert('Failed to remove from wishlist');
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading wishlist...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">My Wishlist</h1>
        <div className="text-gray-600">
          {properties.length} {properties.length === 1 ? 'property' : 'properties'}
        </div>
      </div>

      {properties.length === 0 ? (
        <div className="bg-white rounded-lg shadow-md p-12 text-center">
          <div className="text-6xl mb-4">❤️</div>
          <h2 className="text-2xl font-bold mb-2">Your wishlist is empty</h2>
          <p className="text-gray-600 mb-6">
            Start adding properties to your wishlist to keep track of your favorites!
          </p>
          <a
            href="/"
            className="inline-block bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700"
          >
            Browse Properties
          </a>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {properties.map((property) => (
            <div key={property.id} className="relative">
              <PropertyCard property={{ ...property, inWishlist: true }} />
              <button
                onClick={() => handleRemove(property.id)}
                className="absolute top-2 right-2 bg-red-500 text-white p-2 rounded-full hover:bg-red-600 shadow-lg"
                title="Remove from wishlist"
              >
                ❌
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default MyWishlist;
