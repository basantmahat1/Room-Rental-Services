import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { authAPI } from '../services/api';

const AdminDashboard = () => {
  const { user } = useAuth();
  const [testResult, setTestResult] = useState('');
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    activeUsers: 0,
    properties: 0,
    revenue: 0
  });

  const testAdminAPI = async () => {
    setLoading(true);
    try {
      const response = await authAPI.testAdmin();
      setTestResult(`API Test Successful: ${response.data.message}`);
    } catch (error) {
      setTestResult(`API Test Failed: ${error.response?.data?.message || error.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Mock data for demo
  useEffect(() => {
    setStats({
      totalUsers: 1542,
      activeUsers: 1248,
      properties: 567,
      revenue: 125000
    });
  }, []);

  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-r from-gray-900 to-gray-800 text-white shadow rounded-lg p-6">
        <h1 className="text-3xl font-bold mb-2">
          Admin Dashboard 👑
        </h1>
        <p className="text-gray-300">
          Welcome back, {user?.name}. Manage the entire platform from here.
        </p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Total Users</h3>
              <p className="text-3xl font-bold text-blue-600">{stats.totalUsers}</p>
            </div>
            <div className="bg-blue-100 p-3 rounded-lg">
              <span className="text-2xl">👥</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Active</span>
              <span className="font-semibold">{stats.activeUsers}</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Properties</h3>
              <p className="text-3xl font-bold text-green-600">{stats.properties}</p>
            </div>
            <div className="bg-green-100 p-3 rounded-lg">
              <span className="text-2xl">🏢</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Listed Today</span>
              <span className="font-semibold">12</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Revenue</h3>
              <p className="text-3xl font-bold text-purple-600">${stats.revenue.toLocaleString()}</p>
            </div>
            <div className="bg-purple-100 p-3 rounded-lg">
              <span className="text-2xl">💰</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">This Month</span>
              <span className="font-semibold">+12.5%</span>
            </div>
          </div>
        </div>

        <div className="bg-white shadow rounded-lg p-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold text-gray-900">Bookings</h3>
              <p className="text-3xl font-bold text-orange-600">342</p>
            </div>
            <div className="bg-orange-100 p-3 rounded-lg">
              <span className="text-2xl">📅</span>
            </div>
          </div>
          <div className="mt-4">
            <div className="flex justify-between text-sm">
              <span className="text-gray-600">Pending</span>
              <span className="font-semibold">23</span>
            </div>
          </div>
        </div>
      </div>

      {/* API Test Section */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">API Test</h2>
        <button
          onClick={testAdminAPI}
          disabled={loading}
          className="btn-primary mb-4"
        >
          {loading ? 'Testing...' : 'Test Admin API Access'}
        </button>
        {testResult && (
          <div className={`p-3 rounded-lg ${
            testResult.includes('Successful') 
              ? 'bg-green-50 text-green-700 border border-green-200' 
              : 'bg-red-50 text-red-700 border border-red-200'
          }`}>
            {testResult}
          </div>
        )}
      </div>

      {/* Management Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* User Management */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">User Management</h2>
          <div className="space-y-3">
            {[
              { type: 'Tenants', count: 856, change: '+5.2%' },
              { type: 'Owners', count: 412, change: '+3.8%' },
              { type: 'Admins', count: 3, change: '0%' },
            ].map((item) => (
              <div key={item.type} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                <div className="font-semibold">{item.type}</div>
                <div className="flex items-center space-x-4">
                  <div className="font-bold">{item.count}</div>
                  <div className={`px-2 py-1 rounded text-sm ${
                    item.change.startsWith('+') 
                      ? 'bg-green-100 text-green-800' 
                      : 'bg-gray-100 text-gray-800'
                  }`}>
                    {item.change}
                  </div>
                </div>
              </div>
            ))}
          </div>
          <button className="w-full mt-4 btn-primary">
            View All Users
          </button>
        </div>

        {/* Platform Stats */}
        <div className="bg-white shadow rounded-lg p-6">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Platform Statistics</h2>
          <div className="space-y-4">
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">User Satisfaction</span>
                <span className="text-sm font-medium text-gray-700">92%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-green-600 h-2 rounded-full" style={{ width: '92%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">System Uptime</span>
                <span className="text-sm font-medium text-gray-700">99.9%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-blue-600 h-2 rounded-full" style={{ width: '99.9%' }}></div>
              </div>
            </div>
            
            <div>
              <div className="flex justify-between mb-1">
                <span className="text-sm font-medium text-gray-700">Conversion Rate</span>
                <span className="text-sm font-medium text-gray-700">68%</span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div className="bg-purple-600 h-2 rounded-full" style={{ width: '68%' }}></div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-white shadow rounded-lg p-6">
        <h2 className="text-xl font-bold text-gray-900 mb-4">Recent Platform Activity</h2>
        <div className="space-y-3">
          {[
            { id: 1, activity: 'New property listed by John Doe', time: '10 min ago', type: 'property' },
            { id: 2, activity: 'User registration completed', time: '25 min ago', type: 'user' },
            { id: 3, activity: 'Booking confirmed for Property #123', time: '1 hour ago', type: 'booking' },
            { id: 4, activity: 'System backup completed', time: '2 hours ago', type: 'system' },
            { id: 5, activity: 'Monthly report generated', time: '3 hours ago', type: 'report' },
          ].map((item) => (
            <div key={item.id} className="flex items-center p-3 bg-gray-50 rounded-lg">
              <div className={`w-2 h-2 rounded-full mr-3 ${
                item.type === 'property' ? 'bg-blue-500' :
                item.type === 'user' ? 'bg-green-500' :
                item.type === 'booking' ? 'bg-purple-500' :
                'bg-gray-500'
              }`}></div>
              <div className="flex-1">
                <div>{item.activity}</div>
                <div className="text-sm text-gray-500">{item.time}</div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;