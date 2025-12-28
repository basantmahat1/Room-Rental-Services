import { useEffect, useCallback, useRef } from 'react';
import { useNotifications } from './useNotification';
import notificationService from '../services/notificationService';

/**
 * Hook to manage real-time notifications
 * Subscribes to notification stream and handles incoming notifications
 */
export const useRealtimeNotifications = () => {
  const { addNotification } = useNotifications();
  const eventSourceRef = useRef(null);
  const pollIntervalRef = useRef(null);

  const handleNewNotification = useCallback(
    (notification) => {
      // Ensure notification has all required fields
      const notif = {
        message: notification.message || 'New notification',
        type: notification.type || 'info',
        ...notification,
      };

      // Add to notification context
      addNotification(notif);
    },
    [addNotification]
  );

  const startRealtimeUpdates = useCallback(() => {
    // Try EventSource first (Server-Sent Events)
    eventSourceRef.current = notificationService.subscribeToNotifications(
      handleNewNotification,
      (error) => {
        console.warn('EventSource failed, falling back to polling:', error);
        // Fallback to polling if EventSource fails
        if (pollIntervalRef.current) clearInterval(pollIntervalRef.current);
        pollIntervalRef.current = setInterval(async () => {
          try {
            // Polling implementation would go here
            // For now, we rely on EventSource
          } catch (err) {
            console.error('Polling error:', err);
          }
        }, 30000);
      }
    );
  }, [handleNewNotification]);

  const stopRealtimeUpdates = useCallback(() => {
    if (eventSourceRef.current) {
      eventSourceRef.current.close();
      eventSourceRef.current = null;
    }
    if (pollIntervalRef.current) {
      clearInterval(pollIntervalRef.current);
      pollIntervalRef.current = null;
    }
  }, []);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      startRealtimeUpdates();
    }

    return () => {
      stopRealtimeUpdates();
    };
  }, [startRealtimeUpdates, stopRealtimeUpdates]);

  return {
    startRealtimeUpdates,
    stopRealtimeUpdates,
  };
};

export default useRealtimeNotifications;
