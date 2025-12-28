import { useContext } from 'react';
import { NotificationContext } from '../context/NotificationContext';

export const useToast = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useToast must be used within NotificationProvider');
  }

  return {
    success: (message, duration = 4000) =>
      context.showToast(message, 'success', duration),
    error: (message, duration = 5000) =>
      context.showToast(message, 'error', duration),
    warning: (message, duration = 4000) =>
      context.showToast(message, 'warning', duration),
    info: (message, duration = 4000) =>
      context.showToast(message, 'info', duration),
    dismiss: context.removeToast,
  };
};

export const useConfirm = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useConfirm must be used within NotificationProvider');
  }

  return {
    delete: (message = 'Are you sure you want to delete this item?') =>
      context.showConfirm({
        title: 'Delete',
        message,
        confirmText: 'Delete',
        cancelText: 'Cancel',
        type: 'danger',
      }),
    logout: (message = 'Are you sure you want to logout?') =>
      context.showConfirm({
        title: 'Logout',
        message,
        confirmText: 'Logout',
        cancelText: 'Cancel',
        type: 'warning',
      }),
    confirm: (options = {}) =>
      context.showConfirm({
        title: 'Confirm',
        message: 'Are you sure?',
        confirmText: 'Confirm',
        cancelText: 'Cancel',
        type: 'info',
        ...options,
      }),
    custom: context.showConfirm,
  };
};

// New hook for real-time notifications
export const useNotifications = () => {
  const context = useContext(NotificationContext);

  if (!context) {
    throw new Error('useNotifications must be used within NotificationProvider');
  }

  return {
    notifications: context.notifications,
    unreadCount: context.unreadCount,
    soundEnabled: context.soundEnabled,
    userOnline: context.userOnline,
    addNotification: context.addNotification,
    markAsRead: context.markAsRead,
    markAllAsRead: context.markAllAsRead,
    deleteNotification: context.deleteNotification,
    clearAllNotifications: context.clearAllNotifications,
    getOldNotifications: context.getOldNotifications,
    toggleSound: context.toggleSound,
  };
};
