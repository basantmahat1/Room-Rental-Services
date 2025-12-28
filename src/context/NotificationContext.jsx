import React, { createContext, useCallback, useState, useEffect } from 'react';

export const NotificationContext = createContext();

// Notification sound effect (base64 encoded beep)
const NOTIFICATION_SOUND = "data:audio/wav;base64,UklGRigBAABXQVZFZm10IBAAAAABAAEAQB8AAAB9AAACABAAZGF0YQIBAAAAAA==";

// Utility to play notification sound
const playNotificationSound = () => {
  try {
    const audio = new Audio(NOTIFICATION_SOUND);
    audio.play().catch(() => {
      // Silently fail if audio cannot be played (browser policy, etc)
    });
  } catch (error) {
    // Silently fail
  }
};

export const NotificationProvider = ({ children }) => {
  const [toasts, setToasts] = useState([]);
  const [confirmDialog, setConfirmDialog] = useState(null);
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const [soundEnabled, setSoundEnabled] = useState(true);
  const [userOnline, setUserOnline] = useState(true);

  // Track if user is online
  useEffect(() => {
    const handleOnline = () => setUserOnline(true);
    const handleOffline = () => setUserOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  // Play sound on new notification
  const playSound = useCallback(() => {
    if (soundEnabled && userOnline) {
      playNotificationSound();
    }
  }, [soundEnabled, userOnline]);

  // Toggle sound
  const toggleSound = useCallback(() => {
    setSoundEnabled((prev) => !prev);
  }, []);

  // Add real-time notification
  const addNotification = useCallback((notificationData) => {
    const id = Date.now();
    const notification = {
      id,
      read: false,
      createdAt: new Date(),
      ...notificationData,
    };

    setNotifications((prev) => [notification, ...prev]);
    setUnreadCount((prev) => prev + 1);

    // Play sound when notification arrives
    playSound();

    // Show toast automatically
    showToast(notificationData.message, notificationData.type || 'info', 5000);

    return id;
  }, []);

  // Mark notification as read
  const markAsRead = useCallback((id) => {
    setNotifications((prev) =>
      prev.map((notif) =>
        notif.id === id ? { ...notif, read: true } : notif
      )
    );
    setUnreadCount((prev) => Math.max(0, prev - 1));
  }, []);

  // Mark all as read
  const markAllAsRead = useCallback(() => {
    setNotifications((prev) =>
      prev.map((notif) => ({ ...notif, read: true }))
    );
    setUnreadCount(0);
  }, []);

  // Delete notification
  const deleteNotification = useCallback((id) => {
    setNotifications((prev) => {
      const notif = prev.find((n) => n.id === id);
      if (notif && !notif.read) {
        setUnreadCount((count) => Math.max(0, count - 1));
      }
      return prev.filter((n) => n.id !== id);
    });
  }, []);

  // Clear all notifications
  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
    setUnreadCount(0);
  }, []);

  // Get notifications from last N days
  const getOldNotifications = useCallback((days) => {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - days);
    return notifications.filter((n) => new Date(n.createdAt) >= cutoffDate);
  }, [notifications]);

  const showToast = useCallback((message, type = 'info', duration = 4000) => {
    const id = Date.now();
    const toast = { id, message, type };

    setToasts((prev) => [...prev, toast]);

    if (duration > 0) {
      setTimeout(() => {
        removeToast(id);
      }, duration);
    }

    return id;
  }, []);

  const removeToast = useCallback((id) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const showConfirm = useCallback((options) => {
    return new Promise((resolve) => {
      setConfirmDialog({
        ...options,
        onConfirm: () => {
          options.onConfirm?.();
          setConfirmDialog(null);
          resolve(true);
        },
        onCancel: () => {
          options.onCancel?.();
          setConfirmDialog(null);
          resolve(false);
        },
      });
    });
  }, []);

  const closeConfirm = useCallback(() => {
    if (confirmDialog?.onCancel) {
      confirmDialog.onCancel();
    }
    setConfirmDialog(null);
  }, [confirmDialog]);

  const value = {
    showToast,
    removeToast,
    toasts,
    showConfirm,
    confirmDialog,
    closeConfirm,
    // New notification features
    notifications,
    unreadCount,
    soundEnabled,
    userOnline,
    addNotification,
    markAsRead,
    markAllAsRead,
    deleteNotification,
    clearAllNotifications,
    getOldNotifications,
    toggleSound,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};
