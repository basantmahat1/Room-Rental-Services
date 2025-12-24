import React, { useState, useEffect } from 'react';
import { propertyAPI, bookingAPI } from '../../services/api';

const OwnerAnalytics = () => {
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    totalBookings: 0,
    totalRevenue: 0,
    occupancyRate: 0,
    averageRating: 0
  });
  const [recentActivity, setRecentActivity] = useState([]);
  const [topProperties, setTopProperties] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalytics();
  }, []);

  const loadAnalytics = async () => {
    try {
      const [propertiesRes, bookingsRes] = await Promise.all([
        propertyAPI.getOwnerProperties(),
        bookingAPI.getAll()
      ]);

      const properties = propertiesRes.data.properties;
      const bookings = bookingsRes.data.bookings;

      // Calculate stats
      const totalViews = properties.reduce((sum, p) => sum + (p.view_count || 0), 0);
      const totalRevenue = bookings
        .filter(b => b.status === 'accepted' || b.status === 'completed')
        .reduce((sum, b) => sum + (b.total_amount || 0), 0);
      
      const occupiedProperties = properties.filter(p => 
        bookings.some(b => b.property_id === p.id && b.status === 'accepted')
      ).length;

      const totalRatings = properties.reduce((sum, p) => sum + (p.avg_rating || 0), 0);
      const avgRating = properties.length > 0 ? totalRatings / properties.length : 0;

      setStats({
        totalProperties: properties.length,
        totalViews,
        totalBookings: bookings.length,
        totalRevenue,
        occupancyRate: properties.length > 0 ? (occupiedProperties / properties.length) * 100 : 0,
        averageRating: avgRating
      });

      // Top properties by views
      setTopProperties(
        [...properties]
          .sort((a, b) => (b.view_count || 0) - (a.view_count || 0))
          .slice(0, 5)
      );

      setLoading(false);
    } catch (error) {
      console.error('Error loading analytics:', error);
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Analytics Dashboard</h1>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <div className="bg-gradient-to-br from-blue-500 to-blue-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-blue-100 text-sm mb-1">Total Properties</p>
              <p className="text-3xl font-bold">{stats.totalProperties}</p>
            </div>
            <div className="text-5xl opacity-50">🏠</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-green-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-green-100 text-sm mb-1">Total Revenue</p>
              <p className="text-3xl font-bold">${stats.totalRevenue.toLocaleString()}</p>
            </div>
            <div className="text-5xl opacity-50">💰</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-purple-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-purple-100 text-sm mb-1">Total Views</p>
              <p className="text-3xl font-bold">{stats.totalViews.toLocaleString()}</p>
            </div>
            <div className="text-5xl opacity-50">👁️</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-orange-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-orange-100 text-sm mb-1">Total Bookings</p>
              <p className="text-3xl font-bold">{stats.totalBookings}</p>
            </div>
            <div className="text-5xl opacity-50">📅</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-pink-500 to-pink-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-pink-100 text-sm mb-1">Occupancy Rate</p>
              <p className="text-3xl font-bold">{stats.occupancyRate.toFixed(1)}%</p>
            </div>
            <div className="text-5xl opacity-50">📊</div>
          </div>
        </div>

        <div className="bg-gradient-to-br from-yellow-500 to-yellow-600 text-white rounded-lg shadow-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-yellow-100 text-sm mb-1">Avg Rating</p>
              <p className="text-3xl font-bold">{stats.averageRating.toFixed(1)} ⭐</p>
            </div>
            <div className="text-5xl opacity-50">🌟</div>
          </div>
        </div>
      </div>

      {/* Top Performing Properties */}
      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">Top Performing Properties</h2>
        <div className="space-y-3">
          {topProperties.map((property, index) => (
            <div key={property.id} className="flex items-center gap-4 p-4 bg-gray-50 rounded-lg">
              <div className="text-2xl font-bold text-gray-400">#{index + 1}</div>
              <img
                src={property.primary_image}
                alt={property.title}
                className="w-16 h-16 object-cover rounded"
              />
              <div className="flex-1">
                <div className="font-semibold">{property.title}</div>
                <div className="text-sm text-gray-600">
                  {property.view_count} views • {property.total_reviews || 0} reviews
                </div>
              </div>
              <div className="text-right">
                <div className="font-bold text-green-600">${property.price}</div>
                <div className="text-sm text-gray-500">per month</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default OwnerAnalytics;
