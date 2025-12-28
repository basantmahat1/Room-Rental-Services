// frontend/src/pages/Admin/PaymentVerification.jsx
import React, { useState, useEffect } from 'react';
import { paymentAPI } from '../../services/api';

const PaymentVerification = () => {
  const [payments, setPayments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState('pending_verification');
  const [selectedPayment, setSelectedPayment] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [adminNotes, setAdminNotes] = useState('');

  useEffect(() => {
    loadPayments();
  }, [filter]);

  const loadPayments = async () => {
    try {
      const params = filter !== 'all' ? { status: filter } : {};
      const response = await paymentAPI.getAllPayments(params);
      setPayments(response.data.payments);
    } catch (error) {
      console.error('Error loading payments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleVerify = async (paymentId, status) => {
    if (!confirm(`Are you sure you want to ${status} this payment?`)) return;

    try {
      await paymentAPI.verifyPayment(paymentId, {
        status,
        admin_notes: adminNotes
      });
      
      alert(`Payment ${status} successfully!`);
      setShowModal(false);
      setSelectedPayment(null);
      setAdminNotes('');
      loadPayments();
    } catch (error) {
      alert(error.response?.data?.message || `Failed to ${status} payment`);
    }
  };

  const openVerificationModal = (payment) => {
    setSelectedPayment(payment);
    setShowModal(true);
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'pending': return 'bg-gray-100 text-gray-800 border-gray-300';
      case 'pending_verification': return 'bg-yellow-100 text-yellow-800 border-yellow-300';
      case 'verified': return 'bg-green-100 text-green-800 border-green-300';
      case 'rejected': return 'bg-red-100 text-red-800 border-red-300';
      case 'expired': return 'bg-gray-100 text-gray-600 border-gray-300';
      default: return 'bg-gray-100 text-gray-800 border-gray-300';
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[var(--color-primary)] mx-auto mb-4"></div>
          <p className="text-gray-600">Loading payments...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex justify-between items-center">
          <div>
            <h1 className="text-3xl font-bold" style={{color: 'var(--color-primary)'}}>💳 Payment Verification</h1>
            <p className="text-gray-600 mt-1">Review and verify payment submissions</p>
          </div>
          <div className="text-right">
            <div className="text-sm text-gray-600">Total Payments</div>
            <div className="text-2xl font-bold" style={{color: 'var(--color-primary)'}}>{payments.length}</div>
          </div>
        </div>

        {/* Filter Tabs */}
        <div className="bg-white rounded-lg p-4 shadow-md">
          <div className="flex flex-wrap gap-2">
            {['all', 'pending_verification', 'verified', 'rejected', 'pending', 'expired'].map((status) => (
              <button
                key={status}
                onClick={() => setFilter(status)}
                className={`px-4 py-2 rounded-lg text-sm font-bold capitalize transition-all border ${
                  filter === status
                    ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                    : 'bg-white text-gray-700 border-gray-300 hover:border-[var(--color-primary)]'
                }`}
              >
                {status === 'all' ? 'All Payments' : status.replace('_', ' ')}
              </button>
            ))}
          </div>
        </div>

        {/* Payments List */}
        {payments.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center shadow-md">
            <div className="text-5xl mb-4">💳</div>
            <h2 className="text-xl font-bold text-gray-800 mb-2">No payments found</h2>
            <p className="text-gray-600">There are no payments matching your filter criteria.</p>
          </div>
        ) : (
          <div className="space-y-4">
            {payments.map((payment) => (
              <div key={payment.id} className="bg-white rounded-lg shadow-md border border-gray-200 overflow-hidden">
                <div className="p-6">
                  <div className="flex flex-col lg:flex-row justify-between gap-6">
                    {/* Left Section */}
                    <div className="flex-1 space-y-4">
                      {/* Status and Payment Info */}
                      <div className="flex items-start justify-between">
                        <div>
                          <div className="flex items-center gap-3 mb-2">
                            <span className={`px-3 py-1 rounded-lg text-xs font-bold uppercase ${getStatusColor(payment.payment_status)}`}>
                              {payment.payment_status.replace('_', ' ')}
                            </span>
                            <span className="text-xs text-gray-500">
                              {new Date(payment.created_at).toLocaleString()}
                            </span>
                          </div>
                          <h3 className="text-xl font-bold mb-1" style={{color: 'var(--color-primary)'}}>
                            Payment #{payment.payment_id}
                          </h3>
                          <div className="text-2xl font-bold" style={{color: 'var(--color-accent)'}}>
                            ${payment.amount}
                          </div>
                        </div>
                      </div>

                      {/* Property & Booking Details */}
                      <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Property</div>
                          <div className="font-semibold">{payment.property_title}</div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Tenant</div>
                            <div className="font-semibold text-sm">{payment.tenant_name}</div>
                            <div className="text-xs text-gray-500">{payment.tenant_email}</div>
                          </div>
                          <div>
                            <div className="text-xs text-gray-600 mb-1">Owner</div>
                            <div className="font-semibold text-sm">{payment.owner_name}</div>
                          </div>
                        </div>
                        <div>
                          <div className="text-xs text-gray-600 mb-1">Payment Method</div>
                          <div className="font-semibold text-sm capitalize">{payment.payment_method}</div>
                        </div>
                      </div>

                      {/* Transaction Details */}
                      {payment.transaction_id && (
                        <div className="bg-blue-50 border border-blue-300 rounded-lg p-3">
                          <div className="text-xs font-semibold text-blue-800 mb-1">Transaction ID</div>
                          <div className="font-mono text-sm font-bold">{payment.transaction_id}</div>
                        </div>
                      )}
                    </div>

                    {/* Right Section - Payment Proof */}
                    {payment.payment_proof && (
                      <div className="lg:w-64">
                        <div className="text-xs font-semibold text-gray-600 mb-2">Payment Screenshot</div>
                        <img
                          src={payment.payment_proof}
                          alt="Payment Proof"
                          className="w-full rounded-lg border-2 border-gray-300 cursor-pointer hover:border-[var(--color-primary)] transition-all"
                          onClick={() => window.open(payment.payment_proof, '_blank')}
                        />
                        <p className="text-xs text-gray-500 mt-1 text-center">Click to enlarge</p>
                      </div>
                    )}
                  </div>

                  {/* Admin Notes */}
                  {payment.admin_notes && (
                    <div className="mt-4 bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                      <div className="text-xs font-semibold text-yellow-800 mb-1">Admin Notes</div>
                      <p className="text-sm text-gray-800">{payment.admin_notes}</p>
                    </div>
                  )}

                  {/* Action Buttons */}
                  {payment.payment_status === 'pending_verification' && (
                    <div className="mt-4 pt-4 border-t border-gray-200 flex gap-3">
                      <button
                        onClick={() => openVerificationModal(payment)}
                        className="flex-1 bg-green-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-green-700 transition-colors"
                      >
                        ✓ Verify Payment
                      </button>
                      <button
                        onClick={() => {
                          setSelectedPayment(payment);
                          handleVerify(payment.payment_id, 'rejected');
                        }}
                        className="flex-1 bg-red-600 text-white px-4 py-2 rounded-lg font-bold hover:bg-red-700 transition-colors"
                      >
                        ✗ Reject Payment
                      </button>
                    </div>
                  )}

                  {payment.payment_status === 'verified' && payment.verified_at && (
                    <div className="mt-4 pt-4 border-t border-gray-200 text-center">
                      <div className="text-sm text-green-600 font-semibold">
                        ✓ Verified on {new Date(payment.verified_at).toLocaleString()}
                      </div>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Verification Modal */}
      {showModal && selectedPayment && (
        <div className="modal-overlay">
          <div className="modal-content max-w-lg">
            <div className="flex justify-between items-center p-6 border-b">
              <h2 className="text-2xl font-bold" style={{color: 'var(--color-primary)'}}>Verify Payment</h2>
              <button onClick={() => setShowModal(false)} className="text-gray-400 hover:text-gray-600 text-2xl">
                ×
              </button>
            </div>
            
            <div className="p-6 space-y-4">
              <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                <div className="flex justify-between">
                  <span className="text-gray-600">Payment ID:</span>
                  <span className="font-bold">{selectedPayment.payment_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Amount:</span>
                  <span className="font-bold text-xl" style={{color: 'var(--color-accent)'}}>
                    ${selectedPayment.amount}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Transaction ID:</span>
                  <span className="font-mono text-sm font-bold">{selectedPayment.transaction_id}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Tenant:</span>
                  <span className="font-semibold">{selectedPayment.tenant_name}</span>
                </div>
              </div>

              {selectedPayment.payment_proof && (
                <div>
                  <label className="text-sm font-semibold text-gray-700 mb-2 block">Payment Proof:</label>
                  <img
                    src={selectedPayment.payment_proof}
                    alt="Payment Proof"
                    className="w-full rounded-lg border-2 border-gray-300"
                  />
                </div>
              )}

              <div>
                <label className="form-label">Admin Notes (Optional)</label>
                <textarea
                  rows="3"
                  className="input-ui resize-none"
                  placeholder="Add any notes about this verification..."
                  value={adminNotes}
                  onChange={(e) => setAdminNotes(e.target.value)}
                />
              </div>

              <div className="bg-yellow-50 border border-yellow-300 rounded-lg p-3">
                <p className="text-sm text-yellow-800">
                  ⚠️ Please verify the transaction ID matches the payment proof before approving.
                </p>
              </div>

              <div className="flex gap-3 pt-4">
                <button
                  onClick={() => setShowModal(false)}
                  className="flex-1 btn-outline"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleVerify(selectedPayment.payment_id, 'verified')}
                  className="flex-1 btn-primary bg-green-600 hover:bg-green-700"
                >
                  ✓ Verify & Approve
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PaymentVerification;