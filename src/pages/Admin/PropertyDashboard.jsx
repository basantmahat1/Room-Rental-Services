import React, { useState, useEffect } from 'react';
import { Edit2, Trash2, RotateCcw } from 'lucide-react';
import api from '../../services/api';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';

export default function AdminPropertyDashboard() {
  const [properties, setProperties] = useState([]);
  const [deletedProperties, setDeletedProperties] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('stats');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch all data
      const [propertiesRes, statsRes, deletedRes] = await Promise.all([
        api.get('/properties'),
        api.get('/properties/admin/stats'),
        api.get('/properties/admin/deleted'),
      ]);

      if (propertiesRes.data.success) {
        setProperties(propertiesRes.data.properties || []);
      }

      if (statsRes.data.success) {
        setStats(statsRes.data.stats);
      }

      if (deletedRes.data.success) {
        setDeletedProperties(deletedRes.data.properties || []);
      }
    } catch (error) {
      console.error('Error fetching dashboard data:', error);
      showToast('Error loading dashboard', 'error');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;

    try {
      const response = await api.delete(`/properties/${id}`);
      if (response.data.success) {
        showToast('Property deleted successfully');
        fetchDashboardData();
      }
    } catch (error) {
      showToast('Error deleting property', 'error');
    }
  };

  const handleRestoreProperty = async (id) => {
    try {
      const response = await api.patch(`/properties/${id}/restore`);
      if (response.data.success) {
        showToast('Property restored successfully');
        fetchDashboardData();
      }
    } catch (error) {
      showToast('Error restoring property', 'error');
    }
  };

  const showToast = (message, type = 'success') => {
    setToast({ show: true, message, type });
    setTimeout(() => setToast({ show: false, message: '', type: 'success' }), 3000);
  };

  if (loading) {
    return <Loader />;
  }

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Toast */}
      {toast.show && (
        <Toast message={toast.message} type={toast.type} onClose={() => setToast({ ...toast, show: false })} />
      )}

      {/* Header */}
      <div className="bg-white shadow-sm">
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6">
          <h1 className="text-3xl font-bold text-gray-900">Property Management</h1>
          <p className="text-gray-600 mt-2">View and manage all properties in the system</p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
            {/* Total Active */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
              <div className="text-gray-600 text-sm font-medium">Total Active</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                {stats.total_active || 0}
              </div>
              <p className="text-xs text-gray-500 mt-2">Published & not deleted</p>
            </div>

            {/* Published */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
              <div className="text-gray-600 text-sm font-medium">Published</div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                {stats.total_published || 0}
              </div>
              <p className="text-xs text-gray-500 mt-2">Status = 1</p>
            </div>

            {/* Draft */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
              <div className="text-gray-600 text-sm font-medium">Draft</div>
              <div className="text-3xl font-bold text-yellow-600 mt-2">
                {stats.total_draft || 0}
              </div>
              <p className="text-xs text-gray-500 mt-2">Status = 0</p>
            </div>

            {/* For Rent */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
              <div className="text-gray-600 text-sm font-medium">For Rent</div>
              <div className="text-3xl font-bold text-purple-600 mt-2">
                {stats.total_rent || 0}
              </div>
              <p className="text-xs text-gray-500 mt-2">property_type = rent</p>
            </div>

            {/* For Sale */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-pink-500">
              <div className="text-gray-600 text-sm font-medium">For Sale</div>
              <div className="text-3xl font-bold text-pink-600 mt-2">
                {stats.total_sale || 0}
              </div>
              <p className="text-xs text-gray-500 mt-2">property_type = sale</p>
            </div>

            {/* Deleted */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-red-500">
              <div className="text-gray-600 text-sm font-medium">Deleted</div>
              <div className="text-3xl font-bold text-red-600 mt-2">
                {stats.total_deleted || 0}
              </div>
              <p className="text-xs text-gray-500 mt-2">Soft deleted</p>
            </div>

            {/* Avg Price */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-indigo-500">
              <div className="text-gray-600 text-sm font-medium">Avg Price</div>
              <div className="text-2xl font-bold text-indigo-600 mt-2">
                Rs. {stats.avg_price ? Math.round(stats.avg_price).toLocaleString() : '0'}
              </div>
              <p className="text-xs text-gray-500 mt-2">Average listing price</p>
            </div>

            {/* Price Range */}
            <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-orange-500">
              <div className="text-gray-600 text-sm font-medium">Price Range</div>
              <div className="text-sm font-bold text-orange-600 mt-2">
                <div>Min: Rs. {stats.min_price ? stats.min_price.toLocaleString() : '0'}</div>
                <div>Max: Rs. {stats.max_price ? stats.max_price.toLocaleString() : '0'}</div>
              </div>
              <p className="text-xs text-gray-500 mt-2">Min & Max prices</p>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('stats')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'stats'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Summary
            </button>
            <button
              onClick={() => setActiveTab('properties')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'properties'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              All Properties ({properties.length})
            </button>
            <button
              onClick={() => setActiveTab('deleted')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'deleted'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Deleted ({deletedProperties.length})
            </button>
          </div>

          {/* Stats Summary */}
          {activeTab === 'stats' && stats && (
            <div className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">System Overview</h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between">
                      <span className="text-gray-700">Total Properties:</span>
                      <span className="font-bold">{(stats.total_active || 0) + (stats.total_deleted || 0)}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-700">Active Properties:</span>
                      <span className="font-bold text-green-600">{stats.total_active || 0}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-700">Published:</span>
                      <span className="font-bold">{stats.total_published || 0}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-700">Draft:</span>
                      <span className="font-bold">{stats.total_draft || 0}</span>
                    </li>
                  </ul>
                </div>
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Property Types</h3>
                  <ul className="space-y-3">
                    <li className="flex justify-between">
                      <span className="text-gray-700">For Rent:</span>
                      <span className="font-bold text-purple-600">{stats.total_rent || 0}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-700">For Sale:</span>
                      <span className="font-bold text-pink-600">{stats.total_sale || 0}</span>
                    </li>
                    <li className="flex justify-between">
                      <span className="text-gray-700">Deleted:</span>
                      <span className="font-bold text-red-600">{stats.total_deleted || 0}</span>
                    </li>
                    <li className="flex justify-between border-t pt-3">
                      <span className="text-gray-700 font-medium">Average Price:</span>
                      <span className="font-bold">Rs. {stats.avg_price ? Math.round(stats.avg_price).toLocaleString() : '0'}</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* All Properties Table */}
          {activeTab === 'properties' && (
            <div className="overflow-x-auto">
              {properties.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Title</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Type</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Price</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Status</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Owner</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Created</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map(property => (
                      <tr key={property.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 truncate">{property.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            property.property_type === 'rent'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {property.property_type === 'rent' ? 'Rent' : 'Sale'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium">
                          Rs. {property.price?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            property.status === 1
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {property.status === 1 ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {property.owner_id}
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-xs">
                          {new Date(property.created_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleDeleteProperty(property.id)}
                            className="text-red-600 hover:bg-red-100 p-2 rounded transition"
                            title="Delete"
                          >
                            <Trash2 size={16} />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-600">
                  No properties found.
                </div>
              )}
            </div>
          )}

          {/* Deleted Properties Table */}
          {activeTab === 'deleted' && (
            <div className="overflow-x-auto">
              {deletedProperties.length > 0 ? (
                <table className="w-full text-sm">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Title</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Type</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Deleted At</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Deleted By</th>
                      <th className="px-6 py-3 text-left font-medium text-gray-700">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedProperties.map(property => (
                      <tr key={property.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900 truncate">{property.title}</div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-2 py-1 rounded text-xs font-medium ${
                            property.property_type === 'rent'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {property.property_type === 'rent' ? 'Rent' : 'Sale'}
                          </span>
                        </td>
                        <td className="px-6 py-4 text-gray-600 text-xs">
                          {new Date(property.deleted_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4 text-gray-600">
                          {property.deleted_by || 'N/A'}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleRestoreProperty(property.id)}
                            className="text-green-600 hover:bg-green-100 p-2 rounded transition flex items-center gap-1"
                            title="Restore"
                          >
                            <RotateCcw size={16} />
                            Restore
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-600">
                  No deleted properties.
                </div>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
