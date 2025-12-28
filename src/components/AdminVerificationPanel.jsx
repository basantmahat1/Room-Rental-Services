import React, { useState, useEffect } from 'react';

const AdminVerificationPanel = () => {
    const [verificationRequests, setVerificationRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [selectedRequest, setSelectedRequest] = useState(null);
    const [actionLoading, setActionLoading] = useState(false);

    useEffect(() => {
        fetchVerificationRequests();
    }, []);

    const fetchVerificationRequests = async () => {
        try {
            const response = await fetch('/api/admin/verification-requests', {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });
            const data = await response.json();
            setVerificationRequests(data.requests || []);
        } catch (error) {
            console.error('Error fetching verification requests:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleVerify = async (ownerId) => {
        if (!window.confirm('Are you sure you want to verify this owner?')) {
            return;
        }

        setActionLoading(true);
        try {
            const response = await fetch(`/api/admin/owners/${ownerId}/verify`, {
                method: 'PUT',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                }
            });

            if (response.ok) {
                alert('Owner verified successfully!');
                fetchVerificationRequests();
                setSelectedRequest(null);
            } else {
                throw new Error('Verification failed');
            }
        } catch (error) {
            console.error('Verification error:', error);
            alert('Failed to verify owner');
        } finally {
            setActionLoading(false);
        }
    };

    const handleReject = async (ownerId) => {
        const reason = prompt('Please enter reason for rejection:');
        if (!reason) return;

        setActionLoading(true);
        try {
            const response = await fetch(`/api/admin/owners/${ownerId}/reject`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
                },
                body: JSON.stringify({ reason })
            });

            if (response.ok) {
                alert('Owner verification rejected');
                fetchVerificationRequests();
                setSelectedRequest(null);
            } else {
                throw new Error('Rejection failed');
            }
        } catch (error) {
            console.error('Rejection error:', error);
            alert('Failed to reject verification');
        } finally {
            setActionLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex justify-center items-center h-64">
                <div className="text-xl">Loading verification requests...</div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-blue-600">{verificationRequests.length}</div>
                    <div className="text-sm text-gray-600">Pending Requests</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-yellow-600">
                        {verificationRequests.filter(req => req.total_properties === 0).length}
                    </div>
                    <div className="text-sm text-gray-600">New Owners</div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="text-2xl font-bold text-green-600">
                        {verificationRequests.filter(req => req.verified_properties > 0).length}
                    </div>
                    <div className="text-sm text-gray-600">Partially Verified</div>
                </div>
            </div>

            {/* Requests Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Owner
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Properties
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Member Since
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-200">
                            {verificationRequests.length === 0 ? (
                                <tr>
                                    <td colSpan="5" className="px-6 py-8 text-center text-gray-500">
                                        No verification requests pending
                                    </td>
                                </tr>
                            ) : (
                                verificationRequests.map((request) => (
                                    <tr key={request.user_id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center text-blue-600 font-semibold">
                                                    {request.name?.charAt(0) || 'O'}
                                                </div>
                                                <div className="ml-4">
                                                    <div className="font-medium">{request.name}</div>
                                                    <div className="text-sm text-gray-500">{request.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="space-y-1">
                                                <div className="flex items-center">
                                                    <span className="text-sm">Total: {request.total_properties || 0}</span>
                                                </div>
                                                <div className="flex items-center">
                                                    <span className="text-sm">Verified: {request.verified_properties || 0}</span>
                                                </div>
                                                <div className="w-full bg-gray-200 rounded-full h-2">
                                                    <div 
                                                        className="bg-green-600 h-2 rounded-full"
                                                        style={{ 
                                                            width: `${request.total_properties > 0 
                                                                ? (request.verified_properties / request.total_properties) * 100 
                                                                : 0}%` 
                                                        }}
                                                    ></div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">
                                                {new Date(request.user_since).toLocaleDateString()}
                                            </div>
                                            <div className="text-sm text-gray-500">
                                                {Math.floor((new Date() - new Date(request.user_since)) / (1000 * 60 * 60 * 24))} days ago
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`px-2 py-1 text-xs font-semibold rounded-full ${
                                                request.total_properties === 0 
                                                    ? 'bg-yellow-100 text-yellow-800'
                                                    : request.verified_properties === request.total_properties
                                                    ? 'bg-green-100 text-green-800'
                                                    : 'bg-blue-100 text-blue-800'
                                            }`}>
                                                {request.total_properties === 0 ? 'New Owner' :
                                                 request.verified_properties === request.total_properties ? 'Fully Verified' :
                                                 'Partially Verified'}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={() => setSelectedRequest(request)}
                                                    className="px-3 py-1 text-sm bg-blue-600 text-white rounded hover:bg-blue-700"
                                                >
                                                    View
                                                </button>
                                                <button
                                                    onClick={() => handleVerify(request.user_id)}
                                                    disabled={actionLoading}
                                                    className="px-3 py-1 text-sm bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                                >
                                                    Verify
                                                </button>
                                                <button
                                                    onClick={() => handleReject(request.user_id)}
                                                    disabled={actionLoading}
                                                    className="px-3 py-1 text-sm bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                                >
                                                    Reject
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))
                            )}
                        </tbody>
                    </table>
                </div>
            </div>

            {/* Request Details Modal */}
            {selectedRequest && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-bold">Owner Verification Details</h2>
                                <button
                                    onClick={() => setSelectedRequest(null)}
                                    className="text-gray-500 hover:text-gray-700"
                                >
                                    ✕
                                </button>
                            </div>

                            <div className="space-y-6">
                                {/* Owner Info */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-bold mb-3">Owner Information</h3>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div>
                                            <div className="text-sm text-gray-600">Name</div>
                                            <div className="font-medium">{selectedRequest.name}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Email</div>
                                            <div className="font-medium">{selectedRequest.email}</div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Member Since</div>
                                            <div className="font-medium">
                                                {new Date(selectedRequest.user_since).toLocaleDateString()}
                                            </div>
                                        </div>
                                        <div>
                                            <div className="text-sm text-gray-600">Account Status</div>
                                            <div className="font-medium">Active</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Properties Summary */}
                                <div className="p-4 bg-gray-50 rounded-lg">
                                    <h3 className="font-bold mb-3">Properties Summary</h3>
                                    <div className="grid grid-cols-3 gap-4">
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-blue-600">
                                                {selectedRequest.total_properties || 0}
                                            </div>
                                            <div className="text-sm text-gray-600">Total Properties</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-green-600">
                                                {selectedRequest.verified_properties || 0}
                                            </div>
                                            <div className="text-sm text-gray-600">Verified</div>
                                        </div>
                                        <div className="text-center">
                                            <div className="text-2xl font-bold text-yellow-600">
                                                {(selectedRequest.total_properties || 0) - (selectedRequest.verified_properties || 0)}
                                            </div>
                                            <div className="text-sm text-gray-600">Pending Verification</div>
                                        </div>
                                    </div>
                                </div>

                                {/* Verification Criteria */}
                                <div className="p-4 border rounded-lg">
                                    <h3 className="font-bold mb-3">Verification Checklist</h3>
                                    <div className="space-y-3">
                                        <label className="flex items-center">
                                            <input type="checkbox" className="mr-2" />
                                            <span>Government ID verified</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="mr-2" />
                                            <span>Address verified</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="mr-2" />
                                            <span>Phone number verified</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="mr-2" />
                                            <span>Property ownership documents</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="mr-2" />
                                            <span>No previous violations</span>
                                        </label>
                                    </div>
                                </div>

                                {/* Notes */}
                                <div>
                                    <h3 className="font-bold mb-2">Verification Notes</h3>
                                    <textarea
                                        className="w-full px-3 py-2 border border-gray-300 rounded"
                                        rows="3"
                                        placeholder="Add notes about this verification..."
                                    />
                                </div>

                                {/* Action Buttons */}
                                <div className="flex gap-4 pt-4 border-t">
                                    <button
                                        onClick={() => handleVerify(selectedRequest.user_id)}
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                    >
                                        Approve Verification
                                    </button>
                                    <button
                                        onClick={() => handleReject(selectedRequest.user_id)}
                                        disabled={actionLoading}
                                        className="flex-1 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                    >
                                        Reject Request
                                    </button>
                                    <button
                                        onClick={() => setSelectedRequest(null)}
                                        className="px-4 py-2 border border-gray-300 rounded hover:bg-gray-50"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AdminVerificationPanel;