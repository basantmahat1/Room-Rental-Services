import axios from 'axios';

const API_BASE_URL = 'http://localhost:5000';

// Notification Service for handling all notification-related operations
export const notificationService = {
  // Fetch notifications for current user
  async fetchNotifications(days = 30) {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/notifications`,
        {
          params: { days },
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  // Fetch unread count
  async getUnreadCount() {
    try {
      const response = await axios.get(
        `${API_BASE_URL}/api/notifications/unread/count`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread count:', error);
      return 0;
    }
  },

  // Mark notification as read
  async markAsRead(notificationId) {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/notifications/${notificationId}/read`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  // Mark all notifications as read
  async markAllAsRead() {
    try {
      await axios.patch(
        `${API_BASE_URL}/api/notifications/read-all`,
        {},
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
    } catch (error) {
      console.error('Error marking all notifications as read:', error);
      throw error;
    }
  },

  // Delete notification
  async deleteNotification(notificationId) {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/notifications/${notificationId}`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  },

  // Clear all notifications
  async clearAllNotifications() {
    try {
      await axios.delete(
        `${API_BASE_URL}/api/notifications`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
    } catch (error) {
      console.error('Error clearing notifications:', error);
      throw error;
    }
  },

  // Send notification (admin only)
  async sendNotification(notification) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/notifications/send`,
        notification,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending notification:', error);
      throw error;
    }
  },

  // Send broadcast notification (admin only)
  async sendBroadcastNotification(notification) {
    try {
      const response = await axios.post(
        `${API_BASE_URL}/api/notifications/broadcast`,
        notification,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('token')}`,
          },
        }
      );
      return response.data;
    } catch (error) {
      console.error('Error sending broadcast notification:', error);
      throw error;
    }
  },

  // Subscribe to real-time notifications using EventSource (Server-Sent Events)
  subscribeToNotifications(onNotification, onError) {
    const token = localStorage.getItem('token');
    if (!token) return null;

    try {
      const eventSource = new EventSource(
        `${API_BASE_URL}/api/notifications/stream?token=${token}`
      );

      eventSource.onmessage = (event) => {
        try {
          const data = JSON.parse(event.data);
          onNotification(data);
        } catch (error) {
          console.error('Error parsing notification:', error);
        }
      };

      eventSource.onerror = (error) => {
        console.error('EventSource error:', error);
        eventSource.close();
        if (onError) onError(error);
      };

      return eventSource;
    } catch (error) {
      console.error('Error subscribing to notifications:', error);
      if (onError) onError(error);
      return null;
    }
  },

  // Polling fallback (for browsers that don't support EventSource)
  startPolling(onNotification, interval = 30000) {
    const pollInterval = setInterval(async () => {
      try {
        const data = await this.fetchNotifications(1); // Check last day
        if (data && data.length > 0) {
          const lastNotif = data[0];
          onNotification(lastNotif);
        }
      } catch (error) {
        console.error('Polling error:', error);
      }
    }, interval);

    return () => clearInterval(pollInterval);
  },
};

export default notificationService;
