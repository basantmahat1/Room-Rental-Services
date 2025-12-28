import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Edit2, Trash2, Eye, EyeOff, Plus } from 'lucide-react';
import api from '../../services/api';
import Loader from '../../components/Loader';
import Toast from '../../components/Toast';

export default function OwnerPropertyDashboard() {
  const [properties, setProperties] = useState([]);
  const [deletedProperties, setDeletedProperties] = useState([]);
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('active');
  const [toast, setToast] = useState({ show: false, message: '', type: 'success' });

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    try {
      setLoading(true);

      // Fetch owner's properties
      const [propertiesRes, statsRes, deletedRes] = await Promise.all([
        api.get('/properties/owner/list'),
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

  const handleToggleStatus = async (id, currentStatus) => {
    try {
      const newStatus = currentStatus === 1 ? 0 : 1;
      const response = await api.patch(`/properties/${id}/status`, { status: newStatus });

      if (response.data.success) {
        showToast(newStatus === 1 ? 'Property published' : 'Property unpublished');
        fetchDashboardData();
      }
    } catch (error) {
      showToast('Error updating property status', 'error');
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
        <div className="max-w-7xl mx-auto px-4 md:px-8 py-6 flex justify-between items-center">
          <h1 className="text-3xl font-bold text-gray-900">My Properties</h1>
          <Link
            to="/owner/add-property"
            className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition flex items-center"
          >
            <Plus size={20} className="mr-2" />
            Add Property
          </Link>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 md:px-8 py-8">
        {/* Statistics Cards */}
        {stats && (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-600 text-sm font-medium">Total Properties</div>
              <div className="text-3xl font-bold text-blue-600 mt-2">
                {stats.total_properties || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-600 text-sm font-medium">Published</div>
              <div className="text-3xl font-bold text-green-600 mt-2">
                {stats.published || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-600 text-sm font-medium">Draft</div>
              <div className="text-3xl font-bold text-yellow-600 mt-2">
                {stats.total_properties - (stats.published || 0) || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-600 text-sm font-medium">Rented/Sold</div>
              <div className="text-3xl font-bold text-purple-600 mt-2">
                {stats.sold_rented || 0}
              </div>
            </div>
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="text-gray-600 text-sm font-medium">Deleted</div>
              <div className="text-3xl font-bold text-red-600 mt-2">
                {stats.deleted || 0}
              </div>
            </div>
          </div>
        )}

        {/* Tabs */}
        <div className="bg-white rounded-lg shadow-md mb-6">
          <div className="flex border-b">
            <button
              onClick={() => setActiveTab('active')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'active'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Active Properties ({properties.length})
            </button>
            <button
              onClick={() => setActiveTab('deleted')}
              className={`px-6 py-4 font-medium transition ${
                activeTab === 'deleted'
                  ? 'text-blue-600 border-b-2 border-blue-600'
                  : 'text-gray-600 hover:text-gray-800'
              }`}
            >
              Deleted Items ({deletedProperties.length})
            </button>
          </div>

          {/* Active Properties Table */}
          {activeTab === 'active' && (
            <div className="overflow-x-auto">
              {properties.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Type
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {properties.map(property => (
                      <tr key={property.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {property.title}
                          </div>
                          <div className="text-sm text-gray-500">
                            {property.location_name}
                          </div>
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            property.property_type === 'rent'
                              ? 'bg-blue-100 text-blue-800'
                              : 'bg-green-100 text-green-800'
                          }`}>
                            {property.property_type === 'rent' ? 'Rent' : 'Sale'}
                          </span>
                        </td>
                        <td className="px-6 py-4 font-medium text-gray-900">
                          Rs. {property.price?.toLocaleString()}
                        </td>
                        <td className="px-6 py-4">
                          <span className={`px-3 py-1 rounded-full text-sm font-medium ${
                            property.status === 1
                              ? 'bg-green-100 text-green-800'
                              : 'bg-yellow-100 text-yellow-800'
                          }`}>
                            {property.status === 1 ? 'Published' : 'Draft'}
                          </span>
                        </td>
                        <td className="px-6 py-4">
                          <div className="flex gap-2">
                            <button
                              onClick={() => handleToggleStatus(property.id, property.status)}
                              className="p-2 text-blue-600 hover:bg-blue-100 rounded-lg transition"
                              title={property.status === 1 ? 'Unpublish' : 'Publish'}
                            >
                              {property.status === 1 ? (
                                <Eye size={18} />
                              ) : (
                                <EyeOff size={18} />
                              )}
                            </button>
                            <Link
                              to={`/owner/edit-property/${property.id}`}
                              className="p-2 text-green-600 hover:bg-green-100 rounded-lg transition"
                            >
                              <Edit2 size={18} />
                            </Link>
                            <button
                              onClick={() => handleDeleteProperty(property.id)}
                              className="p-2 text-red-600 hover:bg-red-100 rounded-lg transition"
                            >
                              <Trash2 size={18} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              ) : (
                <div className="p-8 text-center text-gray-600">
                  <p>No active properties yet.</p>
                  <Link
                    to="/owner/add-property"
                    className="text-blue-600 hover:text-blue-800 font-medium mt-2 inline-block"
                  >
                    Add your first property
                  </Link>
                </div>
              )}
            </div>
          )}

          {/* Deleted Properties Table */}
          {activeTab === 'deleted' && (
            <div className="overflow-x-auto">
              {deletedProperties.length > 0 ? (
                <table className="w-full">
                  <thead className="bg-gray-50 border-b">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Deleted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-700 uppercase">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {deletedProperties.map(property => (
                      <tr key={property.id} className="border-b hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div className="font-medium text-gray-900">
                            {property.title}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-600">
                          {new Date(property.deleted_at).toLocaleDateString()}
                        </td>
                        <td className="px-6 py-4">
                          <button
                            onClick={() => handleRestoreProperty(property.id)}
                            className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition text-sm"
                          >
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
