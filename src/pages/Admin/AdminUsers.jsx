// ========================================
// pages/AdminUsers.jsx (NEW - Admin User Management)
// ========================================
import React, { useState, useEffect } from 'react';
import { userAPI } from '../../services/api';

const AdminUsers = () => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  // 🔹 PAGINATION STATES (ADDED)
  const [currentPage, setCurrentPage] = useState(1);
  const usersPerPage = 5;

  useEffect(() => {
    loadUsers();
  }, []);

  const loadUsers = async () => {
    try {
      const response = await userAPI.getAll();
      setUsers(response.data.users);
    } catch (error) {
      console.error('Error loading users:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (userId, currentStatus) => {
    try {
      await userAPI.verify(userId, !currentStatus);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_verified: !currentStatus } : u
      ));
      alert('User verification updated');
    } catch (error) {
      alert('Failed to update verification');
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    try {
      await userAPI.toggleStatus(userId, !currentStatus);
      setUsers(users.map(u => 
        u.id === userId ? { ...u, is_active: !currentStatus } : u
      ));
      alert('User status updated');
    } catch (error) {
      alert('Failed to update status');
    }
  };

  const filteredUsers = users.filter(user => {
    if (filter === 'all') return true;
    return user.role === filter;
  });

  // 🔹 PAGINATION LOGIC (ADDED)
  const indexOfLastUser = currentPage * usersPerPage;
  const indexOfFirstUser = indexOfLastUser - usersPerPage;
  const paginatedUsers = filteredUsers.slice(
    indexOfFirstUser,
    indexOfLastUser
  );

  const totalPages = Math.ceil(filteredUsers.length / usersPerPage);

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p>Loading users...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
   
    <div className="flex justify-between items-center">
        <h1 className="text-3xl font-bold">User Management</h1>
        <div className="text-gray-600">
          Total: {users.length} users
        </div>
      </div>

      {/* Statistics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 mb-1">Tenants</div>
              <div className="text-3xl font-bold text-blue-600">
                {users.filter(u => u.role === 'tenant').length}
              </div>
            </div>
            <div className="text-4xl">👤</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 mb-1">Owners</div>
              <div className="text-3xl font-bold text-green-600">
                {users.filter(u => u.role === 'owner').length}
              </div>
            </div>
            <div className="text-4xl">🏢</div>
          </div>
        </div>
        <div className="bg-white rounded-lg shadow-md p-6">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-gray-600 mb-1">Admins</div>
              <div className="text-3xl font-bold text-purple-600">
                {users.filter(u => u.role === 'admin').length}
              </div>
            </div>
            <div className="text-4xl">👑</div>
          </div>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="bg-white rounded-lg shadow-md p-4">
        <div className="flex flex-wrap gap-2">
          {['all', 'tenant', 'owner', 'admin'].map((role) => (
            <button
              key={role}
              onClick={() => {
                setFilter(role);
                setCurrentPage(1);
              }}
              className={`px-4 py-2 rounded-lg font-medium capitalize transition-colors ${
                filter === role
                  ? 'bg-blue-600 text-white'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {role}
            </button>
          ))}
        </div>
      </div>

      {/* Users Table */}
      <div className="bg-white rounded-lg shadow-md overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3">User</th>
                <th className="px-6 py-3">Email</th>
                <th className="px-6 py-3">Role</th>
                <th className="px-6 py-3">Status</th>
                <th className="px-6 py-3">Joined</th>
                <th className="px-6 py-3">Actions</th>
              </tr>
            </thead>

            <tbody className="divide-y">
              {paginatedUsers.map((user) => (
                <tr key={user.id}>
                  <td className="px-6 py-4">{user.name}</td>
                  <td className="px-6 py-4">{user.email}</td>
                  <td className="px-6 py-4 capitalize">{user.role}</td>
                  <td className="px-6 py-4">
                    {user.is_active ? 'Active' : 'Inactive'}
                  </td>
                  <td className="px-6 py-4">
                    {new Date(user.created_at).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 flex gap-2">
                    <button onClick={() => handleVerify(user.id, user.is_verified)}>
                      {user.is_verified ? '✗' : '✓'}
                    </button>
                    <button onClick={() => handleToggleStatus(user.id, user.is_active)}>
                      {user.is_active ? '🔒' : '🔓'}
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* 🔹 PAGINATION UI (ADDED) */}
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

export default AdminUsers;
