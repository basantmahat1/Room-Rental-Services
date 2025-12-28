import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer
} from 'recharts';

const Analytics = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);
    const [timeRange, setTimeRange] = useState('30d');
    const [analyticsData, setAnalyticsData] = useState(null);

    useEffect(() => {
        fetchAnalytics();
    }, [timeRange, user?.role]);

    const fetchAnalytics = async () => {
        try {
            setLoading(true);
            const endpoint = user?.role === 'admin' ? '/analytics/platform' :
                            user?.role === 'owner' ? '/analytics/owner' :
                            '/analytics/tenant';
            
            const response = await fetch(`/api${endpoint}?timeRange=${timeRange}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            const data = await response.json();
            setAnalyticsData(data);
        } catch (error) {
            console.error('Error fetching analytics:', error);
        } finally {
            setLoading(false);
        }
    };

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8'];

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl">Loading analytics...</div>
            </div>
        );
    }

    // Admin Analytics View
    const renderAdminAnalytics = () => {
        if (!analyticsData) return null;

        return (
            <div className="space-y-6">
                {/* Stats Overview */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="text-2xl font-bold text-blue-600">
                            {analyticsData.userStats?.reduce((sum, item) => sum + item.total_users, 0) || 0}
                        </div>
                        <div className="text-sm text-gray-600">Total Users</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="text-2xl font-bold text-green-600">
                            {analyticsData.propertyStats?.reduce((sum, item) => sum + item.total_properties, 0) || 0}
                        </div>
                        <div className="text-sm text-gray-600">Properties</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="text-2xl font-bold text-purple-600">
                            {analyticsData.bookingStats?.reduce((sum, item) => sum + item.total_bookings, 0) || 0}
                        </div>
                        <div className="text-sm text-gray-600">Bookings</div>
                    </div>
                    <div className="bg-white p-4 rounded-lg shadow">
                        <div className="text-2xl font-bold text-yellow-600">
                            ${analyticsData.bookingStats?.reduce((sum, item) => sum + item.total_revenue, 0)?.toLocaleString() || 0}
                        </div>
                        <div className="text-sm text-gray-600">Revenue</div>
                    </div>
                </div>

                {/* Revenue Chart */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4">Revenue Trend</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={analyticsData.revenueByMonth}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => [`$${value}`, 'Revenue']} />
                                <Legend />
                                <Line type="monotone" dataKey="revenue" stroke="#8884d8" name="Revenue" />
                                <Line type="monotone" dataKey="booking_count" stroke="#82ca9d" name="Bookings" />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Top Properties */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4">Top Performing Properties</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {analyticsData.topProperties?.map((property) => (
                                    <tr key={property.id}>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{property.title}</div>
                                            <div className="text-sm text-gray-500">{property.owner_name}</div>
                                        </td>
                                        <td className="px-4 py-3">{property.booking_count}</td>
                                        <td className="px-4 py-3">${property.price * property.booking_count}</td>
                                        <td className="px-4 py-3">
                                            <div className="flex items-center">
                                                <span className="mr-2">{property.avg_rating.toFixed(1)}</span>
                                                <div className="flex">
                                                    {[...Array(5)].map((_, i) => (
                                                        <span key={i} className={i < Math.floor(property.avg_rating) ? 'text-yellow-400' : 'text-gray-300'}>
                                                            ★
                                                        </span>
                                                    ))}
                                                </div>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        );
    };

    // Owner Analytics View
    const renderOwnerAnalytics = () => {
        if (!analyticsData) return null;

        return (
            <div className="space-y-6">
                {/* Property Performance */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4">Property Performance</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Views</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Bookings</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Inquiries</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Revenue</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Rating</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {analyticsData.propertyPerformance?.map((property) => (
                                    <tr key={property.id}>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{property.title}</div>
                                            <div className="text-sm text-gray-500">${property.price}/month</div>
                                        </td>
                                        <td className="px-4 py-3">{property.view_count}</td>
                                        <td className="px-4 py-3">{property.total_bookings}</td>
                                        <td className="px-4 py-3">{property.total_inquiries}</td>
                                        <td className="px-4 py-3">${property.total_revenue || 0}</td>
                                        <td className="px-4 py-3">{property.avg_rating.toFixed(1)}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Booking Trends */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4">Booking Trends</h3>
                    <div className="h-80">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analyticsData.bookingTrends}>
                                <CartesianGrid strokeDasharray="3 3" />
                                <XAxis dataKey="month" />
                                <YAxis />
                                <Tooltip formatter={(value) => [typeof value === 'number' ? `$${value}` : value, 'Value']} />
                                <Legend />
                                <Bar dataKey="revenue" fill="#8884d8" name="Revenue" />
                                <Bar dataKey="booking_count" fill="#82ca9d" name="Bookings" />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Occupancy Rate */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4">Occupancy Rate</h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {analyticsData.occupancyData?.map((property) => (
                            <div key={property.id} className="p-4 border rounded-lg">
                                <div className="font-medium mb-2">{property.title}</div>
                                <div className="flex items-center justify-between mb-2">
                                    <span className="text-sm text-gray-600">Occupancy</span>
                                    <span className="font-bold">{property.occupancy_rate}%</span>
                                </div>
                                <div className="w-full bg-gray-200 rounded-full h-2">
                                    <div 
                                        className="bg-green-600 h-2 rounded-full"
                                        style={{ width: `${Math.min(property.occupancy_rate, 100)}%` }}
                                    ></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    // Tenant Analytics View
    const renderTenantAnalytics = () => {
        if (!analyticsData) return null;

        return (
            <div className="space-y-6">
                {/* Booking History */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4">Booking History</h3>
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Property</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Dates</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Amount</th>
                                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase">Status</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-200">
                                {analyticsData.bookingHistory?.map((booking) => (
                                    <tr key={booking.id}>
                                        <td className="px-4 py-3">
                                            <div className="font-medium">{booking.property_title}</div>
                                            <div className="text-sm text-gray-500">{booking.property_address}</div>
                                        </td>
                                        <td className="px-4 py-3">
                                            <div>{new Date(booking.check_in_date).toLocaleDateString()} - {new Date(booking.check_out_date).toLocaleDateString()}</div>
                                            <div className="text-sm text-gray-500">{booking.stay_duration} days</div>
                                        </td>
                                        <td className="px-4 py-3">${booking.total_amount}</td>
                                        <td className="px-4 py-3">
                                            <span className={`px-2 py-1 rounded-full text-xs ${
                                                booking.status === 'confirmed' ? 'bg-green-100 text-green-800' :
                                                booking.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                                                'bg-red-100 text-red-800'
                                            }`}>
                                                {booking.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>

                {/* Wishlist Stats */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4">Wishlist Statistics</h3>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{analyticsData.wishlistStats?.total_wishlisted || 0}</div>
                            <div className="text-sm text-gray-600">Properties Saved</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">${analyticsData.wishlistStats?.avg_wishlist_price?.toFixed(2) || 0}</div>
                            <div className="text-sm text-gray-600">Average Price</div>
                        </div>
                        <div className="text-center p-4 bg-purple-50 rounded-lg">
                            <div className="text-2xl font-bold text-purple-600">${analyticsData.wishlistStats?.max_wishlist_price || 0}</div>
                            <div className="text-sm text-gray-600">Highest Price</div>
                        </div>
                    </div>
                </div>

                {/* Search History */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h3 className="text-lg font-bold mb-4">Recent Searches</h3>
                    <div className="space-y-2">
                        {analyticsData.searchHistory?.map((search, index) => (
                            <div key={index} className="flex justify-between items-center p-3 bg-gray-50 rounded-lg">
                                <div>
                                    <div className="font-medium">{search.search_query}</div>
                                    <div className="text-sm text-gray-500">
                                        {new Date(search.last_searched).toLocaleDateString()}
                                    </div>
                                </div>
                                <div className="text-sm text-gray-600">{search.search_count} times</div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    };

    return (
        <div className="p-6">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                <div className="flex gap-2">
                    <select
                        value={timeRange}
                        onChange={(e) => setTimeRange(e.target.value)}
                        className="px-3 py-2 border border-gray-300 rounded-md"
                    >
                        <option value="7d">Last 7 Days</option>
                        <option value="30d">Last 30 Days</option>
                        <option value="90d">Last 90 Days</option>
                        <option value="1y">Last Year</option>
                    </select>
                    <button
                        onClick={fetchAnalytics}
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                    >
                        Refresh
                    </button>
                </div>
            </div>

            {user?.role === 'admin' && renderAdminAnalytics()}
            {user?.role === 'owner' && renderOwnerAnalytics()}
            {user?.role === 'tenant' && renderTenantAnalytics()}
        </div>
    );
};

export default Analytics;