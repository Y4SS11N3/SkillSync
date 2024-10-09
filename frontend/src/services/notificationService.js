import axios from 'axios';
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let socket;

/**
 * Service object containing methods for notification-related operations and WebSocket connections.
 * @namespace
 */
const notificationService = {
  /**
   * Initializes the WebSocket connection.
   * @param {string} token - The authentication token.
   * @returns {Promise<Socket>} A promise that resolves with the socket instance.
   */
  initSocket: (token) => {
    return new Promise((resolve, reject) => {
      if (!socket || !socket.connected) {
        socket = io(SOCKET_URL, {
          query: { token },
          transports: ['websocket'],
        });

        socket.on('connect', () => {
          console.log('Connected to WebSocket');
          resolve(socket);
        });

        socket.on('connect_error', (error) => {
          console.error('Connection error:', error);
          reject(error);
        });
      } else {
        resolve(socket);
      }
    });
  },

  /**
   * Joins a user-specific room for real-time notifications.
   * @param {string} userId - The ID of the user.
   */
  joinUserRoom: (userId) => {
    if (socket && socket.connected) {
      socket.emit('join_user', userId);
    }
  },

  /**
   * Registers a callback for new notification events.
   * @param {Function} callback - The function to be called when a new notification is received.
   */
  onNewNotification: (callback) => {
    if (socket) {
      socket.on('new_notification', callback);
    }
  },

  /**
   * Removes a previously registered callback for new notification events.
   * @param {Function} callback - The function to be removed from the event listener.
   */
  offNewNotification: (callback) => {
    if (socket) {
      socket.off('new_notification', callback);
    }
  },

  /**
   * Fetches all notifications for the authenticated user.
   * @async
   * @returns {Promise<Array>} A promise that resolves with an array of notifications.
   * @throws {Error} If there's an error fetching notifications.
   */
  async getNotifications() {
    try {
      const response = await axiosInstance.get('/notifications');
      return response.data;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  },

  /**
   * Marks a specific notification as read.
   * @async
   * @param {string} notificationId - The ID of the notification to mark as read.
   * @returns {Promise<Object>} A promise that resolves with the updated notification data.
   * @throws {Error} If there's an error marking the notification as read.
   */
  async markAsRead(notificationId) {
    try {
      const response = await axiosInstance.put(`/notifications/${notificationId}/read`);
      return response.data;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  },

  /**
   * Fetches the count of unread notifications for the authenticated user.
   * @async
   * @returns {Promise<number>} A promise that resolves with the count of unread notifications.
   * @throws {Error} If there's an error fetching the unread notification count.
   */
  async getUnreadCount() {
    try {
      const response = await axiosInstance.get('/notifications/unread-count');
      return response.data.count;
    } catch (error) {
      console.error('Error fetching unread notification count:', error);
      throw error;
    }
  },

  /**
   * Clears all notifications for the authenticated user.
   * @async
   * @returns {Promise<Object>} A promise that resolves with the response data.
   * @throws {Error} If there's an error clearing all notifications.
   */
  async clearAllNotifications() {
    try {
      const response = await axiosInstance.delete('/notifications');
      return response.data;
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  },

  /**
   * Deletes a specific notification.
   * @async
   * @param {string} notificationId - The ID of the notification to delete.
   * @returns {Promise<Object>} A promise that resolves with the response data.
   * @throws {Error} If there's an error deleting the notification.
   */
  async deleteNotification(notificationId) {
    try {
      const response = await axiosInstance.delete(`/notifications/${notificationId}`);
      return response.data;
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
};

export default notificationService;