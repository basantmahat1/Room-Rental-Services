import React, { useState, useRef, useEffect } from 'react';
import { useNotifications } from '../hooks/useNotification';

const NotificationPanel = () => {
  const {
    notifications,
    unreadCount,
    markAsRead,
    markAllAsRead,
    deleteNotification,
  } = useNotifications();

  const [isOpen, setIsOpen] = useState(false);
  const [displayDays, setDisplayDays] = useState(7);
  const panelRef = useRef(null);

  // Close panel when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (panelRef.current && !panelRef.current.contains(e.target)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter notifications by days
  const filteredNotifications = notifications.filter((notif) => {
    const notifDate = new Date(notif.createdAt);
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - displayDays);
    return notifDate >= cutoffDate;
  });

  // Group notifications by date
  const groupedByDate = filteredNotifications.reduce((acc, notif) => {
    const date = new Date(notif.createdAt).toLocaleDateString();
    if (!acc[date]) acc[date] = [];
    acc[date].push(notif);
    return acc;
  }, {});

  // Format time ago
  const getTimeAgo = (date) => {
    const now = new Date();
    const seconds = Math.floor((now - new Date(date)) / 1000);
    
    if (seconds < 60) return 'just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)}h ago`;
    if (seconds < 604800) return `${Math.floor(seconds / 86400)}d ago`;
    return 'a while ago';
  };

  // Get notification color based on type
  const getNotifColor = (type) => {
    const colors = {
      success: 'bg-green-50 border-green-200',
      warning: 'bg-yellow-50 border-yellow-200',
      error: 'bg-red-50 border-red-200',
      info: 'bg-blue-50 border-blue-200',
      booking: 'bg-green-50 border-green-200',
      payment: 'bg-blue-50 border-blue-200',
      reminder: 'bg-yellow-50 border-yellow-200',
      admin: 'bg-red-50 border-red-200',
    };
    return colors[type] || colors.info;
  };

  // Get notification icon based on type
  const getNotifIcon = (type) => {
    const icons = {
      success: '✅',
      warning: '⚠️',
      error: '❌',
      info: 'ℹ️',
      booking: '✅',
      payment: '💰',
      reminder: '⏰',
      admin: '📢',
    };
    return icons[type] || icons.info;
  };

  return (
    <div className="relative" ref={panelRef}>
      {/* Bell Icon Button */}
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-2 hover:bg-white/20 rounded-lg transition-colors"
        title={unreadCount > 0 ? `${unreadCount} unread notifications` : 'No new notifications'}
      >
        <span className="text-2xl">🔔</span>
        
        {/* Unread Badge */}
        {unreadCount > 0 && (
          <span className="absolute top-0 right-0 bg-red-500 text-white text-xs font-bold rounded-full w-6 h-6 flex items-center justify-center">
            {unreadCount > 99 ? '99+' : unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel Dropdown */}
      {isOpen && (
        <div className="absolute right-0 top-12 w-96 bg-white rounded-lg shadow-2xl border border-[#e2e8f0] z-50 max-h-[600px] flex flex-col">
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-[#e2e8f0] bg-[#f8fafc]">
            <h2 className="text-lg font-bold text-[#1A2B3C]">🔔 Notifications</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-400 hover:text-gray-600 text-xl"
            >
              ✕
            </button>
          </div>

          {/* Filter Buttons */}
          <div className="flex gap-2 p-3 border-b border-[#e2e8f0] bg-white">
            {[7, 15, 30].map((days) => (
              <button
                key={days}
                onClick={() => setDisplayDays(days)}
                className={`text-xs px-3 py-1 rounded-full font-medium transition-all ${
                  displayDays === days
                    ? 'bg-[#00BFA5] text-white'
                    : 'bg-[#f1f5f9] text-[#64748b] hover:bg-[#e2e8f0]'
                }`}
              >
                {days}d
              </button>
            ))}
          </div>

          {/* Mark All as Read Button */}
          {unreadCount > 0 && (
            <button
              onClick={markAllAsRead}
              className="px-4 py-2 text-sm text-[#00BFA5] font-medium hover:bg-[#f8fafc] transition-colors border-b border-[#e2e8f0]"
            >
              Mark all as read
            </button>
          )}

          {/* Notifications List */}
          <div className="flex-1 overflow-y-auto">
            {filteredNotifications.length === 0 ? (
              <div className="flex flex-col items-center justify-center h-64 text-[#64748b]">
                <span className="text-4xl mb-2">📭</span>
                <p className="text-sm">No notifications yet</p>
              </div>
            ) : (
              <div className="space-y-2 p-2">
                {Object.entries(groupedByDate).map(([date, notifs]) => (
                  <div key={date}>
                    {/* Date Separator */}
                    <div className="px-3 py-2 text-xs font-bold text-[#94a3b8] uppercase tracking-widest">
                      {date === new Date().toLocaleDateString() ? 'Today' : date}
                    </div>

                    {/* Notifications for this date */}
                    {notifs.map((notif) => (
                      <div
                        key={notif.id}
                        onClick={() => !notif.read && markAsRead(notif.id)}
                        className={`p-3 rounded-lg cursor-pointer transition-all border-l-4 ${
                          notif.read
                            ? 'bg-white border-[#e2e8f0]'
                            : `${getNotifColor(notif.type)} border-[#00BFA5] hover:shadow-md`
                        }`}
                      >
                        <div className="flex items-start gap-2">
                          <span className="text-lg mt-0.5">{getNotifIcon(notif.type)}</span>
                          <div className="flex-1 min-w-0">
                            <p className={`text-sm font-medium line-clamp-2 ${notif.read ? 'text-[#94a3b8]' : 'text-[#1e293b]'}`}>
                              {notif.message}
                            </p>
                            <p className="text-xs text-[#94a3b8] mt-1">
                              {getTimeAgo(notif.createdAt)}
                            </p>
                          </div>
                          <button
                            onClick={(e) => {
                              e.stopPropagation();
                              deleteNotification(notif.id);
                            }}
                            className="flex-shrink-0 text-gray-400 hover:text-gray-600 text-lg"
                          >
                            ✕
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Footer */}
          <div className="p-3 border-t border-[#e2e8f0] bg-[#f8fafc] text-xs text-[#64748b] text-center">
            Notifications older than {displayDays} days are hidden
          </div>
        </div>
      )}
    </div>
  );
};

export default NotificationPanel;
