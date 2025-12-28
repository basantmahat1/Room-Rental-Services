import React, { useState } from 'react';
import { saveAs } from 'file-saver';

const ExportCSV = ({ userRole }) => {
    const [exportType, setExportType] = useState('users');
    const [loading, setLoading] = useState(false);
    const [filters, setFilters] = useState({
        role: '',
        status: '',
        startDate: '',
        endDate: '',
        isAvailable: '',
        verified: ''
    });

    const exportData = async () => {
        setLoading(true);
        try {
            let endpoint = '';
            let params = new URLSearchParams();
            
            switch (exportType) {
                case 'users':
                    endpoint = '/analytics/export/users';
                    if (filters.role) params.append('role', filters.role);
                    if (filters.startDate) params.append('startDate', filters.startDate);
                    if (filters.endDate) params.append('endDate', filters.endDate);
                    break;
                    
                case 'properties':
                    endpoint = '/analytics/export/properties';
                    if (filters.isAvailable) params.append('isAvailable', filters.isAvailable);
                    if (filters.verified) params.append('verified', filters.verified);
                    break;
                    
                case 'bookings':
                    endpoint = '/analytics/export/bookings';
                    if (filters.status) params.append('status', filters.status);
                    if (filters.startDate) params.append('startDate', filters.startDate);
                    if (filters.endDate) params.append('endDate', filters.endDate);
                    break;
            }
            
            const url = `/api${endpoint}?${params.toString()}`;
            const response = await fetch(url, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            
            if (!response.ok) throw new Error('Export failed');
            
            const blob = await response.blob();
            const filename = `${exportType}_${new Date().toISOString().split('T')[0]}.csv`;
            saveAs(blob, filename);
            
            alert(`Exported ${exportType} successfully!`);
        } catch (error) {
            console.error('Export error:', error);
            alert('Export failed. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const renderFilters = () => {
        switch (exportType) {
            case 'users':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Role
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                                value={filters.role}
                                onChange={(e) => setFilters({...filters, role: e.target.value})}
                            >
                                <option value="">All Roles</option>
                                <option value="tenant">Tenant</option>
                                <option value="owner">Owner</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Start Date
                            </label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                                value={filters.startDate}
                                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                End Date
                            </label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                                value={filters.endDate}
                                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                            />
                        </div>
                    </div>
                );
                
            case 'properties':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Availability
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                                value={filters.isAvailable}
                                onChange={(e) => setFilters({...filters, isAvailable: e.target.value})}
                            >
                                <option value="">All</option>
                                <option value="true">Available</option>
                                <option value="false">Not Available</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Verification Status
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                                value={filters.verified}
                                onChange={(e) => setFilters({...filters, verified: e.target.value})}
                            >
                                <option value="">All</option>
                                <option value="true">Verified</option>
                                <option value="false">Not Verified</option>
                            </select>
                        </div>
                    </div>
                );
                
            case 'bookings':
                return (
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Status
                            </label>
                            <select
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                                value={filters.status}
                                onChange={(e) => setFilters({...filters, status: e.target.value})}
                            >
                                <option value="">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="confirmed">Confirmed</option>
                                <option value="cancelled">Cancelled</option>
                                <option value="completed">Completed</option>
                            </select>
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Check-in From
                            </label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                                value={filters.startDate}
                                onChange={(e) => setFilters({...filters, startDate: e.target.value})}
                            />
                        </div>
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Check-out To
                            </label>
                            <input
                                type="date"
                                className="w-full px-3 py-2 border border-gray-300 rounded"
                                value={filters.endDate}
                                onChange={(e) => setFilters({...filters, endDate: e.target.value})}
                            />
                        </div>
                    </div>
                );
                
            default:
                return null;
        }
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <h3 className="text-lg font-bold mb-4">Export Data</h3>
            
            {/* Export Type Selection */}
            <div className="mb-6">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                    Select Data to Export
                </label>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                    <button
                        onClick={() => setExportType('users')}
                        className={`px-4 py-2 rounded ${
                            exportType === 'users' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Users
                    </button>
                    <button
                        onClick={() => setExportType('properties')}
                        className={`px-4 py-2 rounded ${
                            exportType === 'properties' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Properties
                    </button>
                    <button
                        onClick={() => setExportType('bookings')}
                        className={`px-4 py-2 rounded ${
                            exportType === 'bookings' 
                                ? 'bg-blue-600 text-white' 
                                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                        }`}
                    >
                        Bookings
                    </button>
                </div>
            </div>
            
            {/* Filters */}
            <div className="mb-6">
                <h4 className="font-medium text-gray-700 mb-3">Filters</h4>
                {renderFilters()}
            </div>
            
            {/* Export Button */}
            <div className="flex justify-between items-center">
                <div className="text-sm text-gray-500">
                    Data will be exported as CSV file
                </div>
                <button
                    onClick={exportData}
                    disabled={loading}
                    className="px-6 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                >
                    {loading ? 'Exporting...' : 'Export CSV'}
                </button>
            </div>
            
            {/* Instructions */}
            <div className="mt-6 p-3 bg-blue-50 rounded text-sm text-blue-700">
                <p className="font-medium mb-1">Export Instructions:</p>
                <ul className="list-disc pl-5 space-y-1">
                    <li>Select the type of data you want to export</li>
                    <li>Apply filters if needed (optional)</li>
                    <li>Click Export CSV to download the file</li>
                    <li>CSV files can be opened in Excel, Google Sheets, or any text editor</li>
                </ul>
            </div>
        </div>
    );
};

export default ExportCSV;