import React, { useState, useEffect } from 'react';
import { propertyAPI } from '../../services/api';
import { Link, useNavigate } from 'react-router-dom';

const AdminDeletedProperties = ({ inline = false, initialPage = 1, initialLimit }) => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const defaultLimit = initialLimit || (inline ? 5 : 10);
  const [limit] = useState(defaultLimit);
  const [currentPage, setCurrentPage] = useState(initialPage);
  const [total, setTotal] = useState(0);
  const navigate = useNavigate();

  const loadDeleted = async (page = 1) => {
    setLoading(true);
    try {
      const params = { limit, offset: (page - 1) * limit };
      const res = await propertyAPI.getDeleted(params);
      setProperties(res.data.properties || []);
      setTotal(res.data.total || res.data.properties?.length || 0);
    } catch (err) {
      console.error('Failed to load deleted properties', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDeleted(currentPage);
  }, [currentPage]);

  // Republish: restore and set status = 1
  const handleRepublish = async (id) => {
    if (!confirm('Republish this property? It will be active again.')) return;
    try {
      await propertyAPI.restore(id);
      loadDeleted(currentPage);
    } catch (err) {
      alert('Failed to republish property');
    }
  };

  // Delete Permanently: hard delete
  const handleDeletePermanently = async (id) => {
    if (!confirm('⚠️ DELETE PERMANENTLY? This cannot be undone!')) return;
    try {
      await propertyAPI.deletePermanently(id);
      loadDeleted(currentPage);
    } catch (err) {
      alert('Failed to permanently delete property');
    }
  };

  if (loading) return <div className="p-8">Loading...</div>;

  return (
    <div className="p-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold">Deleted Properties</h1>
        <div className="flex items-center gap-2">
          {inline && (
            <a href="/admin/properties/deleted-drafts" className="text-sm text-blue-600 hover:underline">View all deleted</a>
          )}
          <button onClick={() => navigate('/admin/properties')} className="px-3 py-1 bg-gray-200 rounded">Back</button>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Owner</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deleted At</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Deleted By</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {properties.map(p => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div className="flex items-center">
                      <img src={p.primary_image} alt={p.title} className="h-12 w-12 rounded object-cover" />
                      <div className="ml-4">
                        <div className="text-sm font-medium text-gray-900">{p.title}</div>
                        <div className="text-sm text-gray-500">{p.city}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-900">{p.owner_name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{p.deleted_at || '-'}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">{p.deleted_by_name || p.deleted_by || '-'}</td>
                  <td className="px-6 py-4 text-sm">
                    <div className="flex items-center gap-3">
                      <Link to={`/properties/${p.id}`} className="text-blue-600 hover:text-blue-900">View</Link>
                      <button 
                        onClick={() => handleRepublish(p.id)} 
                        className="px-3 py-1 bg-green-100 text-green-700 rounded hover:bg-green-200"
                      >
                        ✓ Republish
                      </button>
                      <button 
                        onClick={() => handleDeletePermanently(p.id)} 
                        className="px-3 py-1 bg-red-100 text-red-700 rounded hover:bg-red-200"
                      >
                        🗑️ Delete
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Show pagination only when not embedded inline */}
      {!inline && (
        <div className="flex justify-center gap-2 mt-4">
          <button disabled={currentPage === 1} onClick={() => setCurrentPage(currentPage -1)} className="px-3 py-1 bg-gray-200 rounded">Prev</button>
          {[...Array(Math.max(1, Math.ceil(total/limit)))].map((_,i) => (
            <button key={i} onClick={() => setCurrentPage(i+1)} className={`px-3 py-1 rounded ${currentPage===i+1? 'bg-blue-600 text-white':'bg-gray-200'}`}>{i+1}</button>
          ))}
          <button disabled={currentPage >= Math.ceil(total/limit)} onClick={() => setCurrentPage(currentPage +1)} className="px-3 py-1 bg-gray-200 rounded">Next</button>
        </div>
      )}
    </div>
  );
};

export default AdminDeletedProperties;
