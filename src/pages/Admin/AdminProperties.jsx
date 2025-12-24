import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { propertyAPI } from '../../services/api';
import{DeleteOutlined} from '@ant-design/icons';

const AdminProperties = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [currentPage, setCurrentPage] = useState(1);
  const [totalProperties, setTotalProperties] = useState(0);
  const [limit] = useState(10); // per page

  useEffect(() => {
    loadProperties(currentPage);
  }, [currentPage]);

  const loadProperties = async (page) => {
    setLoading(true);
    try {
      const response = await propertyAPI.getAll({ limit, offset: (page - 1) * limit });
      setProperties(response.data.properties);
      setTotalProperties(response.data.total);
    } catch (error) {
      console.error('Error loading properties:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (id, currentStatus) => {
    try {
      await propertyAPI.verify(id, !currentStatus);
      setProperties(properties.map(p => 
        p.id === id ? { ...p, is_verified: !currentStatus } : p
      ));
      alert('Property verification updated');
    } catch (error) {
      alert('Failed to update verification');
    }
  };

  const handleDelete = async (id) => {
    if (!confirm('Are you sure you want to delete this property?')) return;

    try {
      await propertyAPI.delete(id);
      setProperties(properties.filter(p => p.id !== id));
      alert('Property deleted successfully');
    } catch (error) {
      alert('Failed to delete property');
    }
  };

  const totalPages = Math.ceil(totalProperties / limit);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading properties...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">Property Management</h1>
        <div className="text-gray-600">
          Total: {totalProperties} properties
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-600 mb-1">Total</div>
          <div className="text-3xl font-bold">{totalProperties}</div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-600 mb-1">Verified</div>
          <div className="text-3xl font-bold text-green-600">
            {properties.filter(p => p.is_verified).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-600 mb-1">Available</div>
          <div className="text-3xl font-bold text-blue-600">
            {properties.filter(p => p.is_available).length}
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="text-gray-600 mb-1">Featured</div>
          <div className="text-3xl font-bold text-purple-600">
            {properties.filter(p => p.is_featured).length}
          </div>
        </div>
      </div>

      {/* Properties List */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Property
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Owner
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Price
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Views
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {properties.map((property) => (
                <tr key={property.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img
                        src={property.primary_image}
                        alt={property.title}
                        className="h-12 w-12 rounded object-cover"
                      />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">
                          {property.title}
                        </div>
                        <div className="text-sm text-gray-500">
                          {property.city}
                        </div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {property.owner_name}
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-green-600">
                    ${property.price}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-1">
                      {property.is_verified && (
                        <span className="px-2 text-xs font-semibold rounded-full bg-green-100 text-green-800">
                          Verified
                        </span>
                      )}
                      {property.is_available && (
                        <span className="px-2 text-xs font-semibold rounded-full bg-blue-100 text-blue-800">
                          Available
                        </span>
                      )}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    {property.view_count}
                  </td>
                  <td className="px-6 py-4 text-sm">
                <div className="flex items-center gap-4">
  <Link
    to={`/properties/${property.id}`}
    className="text-blue-600 hover:text-blue-900 min-w-[40px]"
  >
    View
  </Link>

  <button
    onClick={() => handleVerify(property.id, property.is_verified)}
    className={`min-w-[70px] ${
      property.is_verified
        ? 'text-yellow-600 hover:text-yellow-800'
        : 'text-green-600 hover:text-green-800'
    }`}
  >
    {property.is_verified ? 'Unverify' : 'Verify'}
  </button>

  <button
    onClick={() => handleDelete(property.id)}
    className="text-red-600 hover:text-red-900 text-lg  flex items-center justify-center"
  >
    <DeleteOutlined />
  </button>
</div>

                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

     <div className="flex justify-center gap-2">
        <button
          disabled={currentPage === 1}
          onClick={() => setCurrentPage(currentPage - 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Prev
        </button>

        {[...Array(totalPages)].map((_, i) => (
          <button
            key={i}
            onClick={() => setCurrentPage(i + 1)}
            className={`px-3 py-1 rounded ${
              currentPage === i + 1
                ? 'bg-blue-600 text-white'
                : 'bg-gray-200'
            }`}
          >
            {i + 1}
          </button>
        ))}

        <button
          disabled={currentPage === totalPages}
          onClick={() => setCurrentPage(currentPage + 1)}
          className="px-3 py-1 bg-gray-200 rounded disabled:opacity-50"
        >
          Next
        </button>
      </div>
    </div>
  );
};

export default AdminProperties;
