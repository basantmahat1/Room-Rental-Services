import React from 'react';
import { useNotifications } from '../hooks/useNotification';
import { useToast } from '../hooks/useNotification';

/**
 * Demo component to test the complete notification system
 * Shows all notification types and features
 */
const NotificationDemo = () => {
  const { addNotification, clearAllNotifications, notifications } = useNotifications();
  const toast = useToast();

  // Test notifications with different types
  const testNotifications = [
    {
      message: '✅ Booking confirmed successfully',
      type: 'booking',
      description: 'Your booking for Property has been confirmed',
    },
    {
      message: '💰 Payment received',
      type: 'payment',
      description: 'Your payment of Rs. 15,000 has been received',
    },
    {
      message: '⏰ Reminder: Payment pending',
      type: 'reminder',
      description: 'Your payment is due on December 27, 2025',
    },
    {
      message: '📢 System maintenance at 10 PM',
      type: 'admin',
      description: 'The system will be under maintenance',
    },
    {
      message: '✅ Booking approved',
      type: 'success',
      description: 'Your booking request has been approved',
    },
    {
      message: '⚠️ Warning: Payment not received',
      type: 'warning',
      description: 'We have not received your payment',
    },
  ];

  const handleAddNotification = (notif) => {
    addNotification({
      message: notif.message,
      type: notif.type,
      description: notif.description,
    });
  };

  return (
    <div className="p-6 bg-white rounded-lg shadow-lg">
      <h2 className="text-2xl font-bold mb-4 text-[#1A2B3C]">
        🔔 Notification System Demo
      </h2>

      <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
        <p className="text-sm text-blue-800">
          <strong>Total Notifications:</strong> {notifications.length}
        </p>
      </div>

      {/* Test Buttons */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mb-6">
        {testNotifications.map((notif, index) => (
          <button
            key={index}
            onClick={() => handleAddNotification(notif)}
            className="p-3 bg-gradient-to-r from-[#00BFA5] to-[#1A2B3C] text-white rounded-lg hover:shadow-lg transition-all font-medium text-sm"
          >
            {notif.message}
          </button>
        ))}
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <button
          onClick={() => toast.success('✅ This is a success toast!', 5000)}
          className="px-4 py-2 bg-green-500 text-white rounded-lg hover:bg-green-600 transition"
        >
          Show Success Toast
        </button>
        <button
          onClick={() => toast.error('❌ This is an error toast!', 5000)}
          className="px-4 py-2 bg-red-500 text-white rounded-lg hover:bg-red-600 transition"
        >
          Show Error Toast
        </button>
        <button
          onClick={() => toast.warning('⚠️ This is a warning toast!', 5000)}
          className="px-4 py-2 bg-yellow-500 text-white rounded-lg hover:bg-yellow-600 transition"
        >
          Show Warning Toast
        </button>
        <button
          onClick={() => toast.info('ℹ️ This is an info toast!', 5000)}
          className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition"
        >
          Show Info Toast
        </button>
        <button
          onClick={clearAllNotifications}
          className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600 transition ml-auto"
        >
          Clear All
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-6 p-4 bg-gray-50 rounded-lg">
        <h3 className="font-bold mb-2 text-[#1A2B3C]">📋 How to use notifications:</h3>
        <ul className="text-sm space-y-2 text-gray-700">
          <li>
            <strong>1. Toast Popup:</strong> Shows at top-right corner, auto-dismisses in 3-5 seconds
          </li>
          <li>
            <strong>2. Bell Icon:</strong> Shows unread count, click to open notification panel
          </li>
          <li>
            <strong>3. Sound:</strong> Plays when notification arrives (if enabled)
          </li>
          <li>
            <strong>4. Notification Types:</strong> booking, payment, reminder, admin, success, warning, error, info
          </li>
          <li>
            <strong>5. Real-time Updates:</strong> Notifications update instantly when they arrive
          </li>
        </ul>
      </div>
    </div>
  );
};

export default NotificationDemo;
