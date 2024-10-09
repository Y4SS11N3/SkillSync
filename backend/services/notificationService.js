/**
 * @file notificationService.js
 * @description Service for handling notification operations
 */

const { Notification, User, Exchange } = require('../models/associations');

/**
 * NotificationService class for managing user notifications
 */
class NotificationService {
  /**
   * Create a NotificationService instance
   * @param {Object} io - Socket.io instance for real-time communication
   */
  constructor(io) {
    this.io = io;
  }

  /**
   * Create a new notification
   * @param {string} userId - The ID of the user receiving the notification
   * @param {string} type - The type of notification
   * @param {string} content - The content of the notification
   * @param {string} [relatedId=null] - The ID of the related entity (optional)
   * @param {string} [exchangeId=null] - The ID of the related exchange (optional)
   * @returns {Promise<Object>} The created notification
   * @throws {Error} If there's an error creating the notification
   */
  async createNotification(userId, type, content, relatedId = null, exchangeId = null) {
    try {
      const notification = await Notification.create({
        userId,
        type,
        content,
        relatedId,
        exchangeId
      });
  
      const populatedNotification = await Notification.findByPk(notification.id, {
        include: [
          { model: User, attributes: ['id', 'name'] },
          { model: Exchange, attributes: ['id'] }
        ]
      });
  
      if (this.io) {
        this.io.to(`user_${userId}`).emit('new_notification', populatedNotification);
      }
  
      return populatedNotification;
    } catch (error) {
      console.error('Error creating notification:', error);
      console.error('Attempted with params:', { userId, type, content, relatedId, exchangeId });
      throw error;
    }
  }

  /**
   * Get notifications for a user
   * @param {string} userId - The ID of the user
   * @returns {Promise<Array>} Array of notifications
   * @throws {Error} If there's an error fetching notifications
   */
  async getNotifications(userId) {
    try {
      const notifications = await Notification.findAll({
        where: { userId },
        order: [['createdAt', 'DESC']],
        include: [
          { model: User, attributes: ['id', 'name'] },
          { model: Exchange, attributes: ['id'] }
        ]
      });
      return notifications;
    } catch (error) {
      console.error('Error fetching notifications:', error);
      throw error;
    }
  }

  /**
   * Mark a notification as read
   * @param {string} notificationId - The ID of the notification
   * @param {string} userId - The ID of the user
   * @returns {Promise<Object>} The updated notification
   * @throws {Error} If the notification is not found or there's an error updating it
   */
  async markAsRead(notificationId, userId) {
    try {
      const notification = await Notification.findOne({
        where: { id: notificationId, userId }
      });
      if (!notification) {
        throw new Error('Notification not found');
      }
      notification.isRead = true;
      await notification.save();

      this.io.to(`user_${userId}`).emit('notification_updated', notification);

      return notification;
    } catch (error) {
      console.error('Error marking notification as read:', error);
      throw error;
    }
  }

  /**
   * Get the count of unread notifications for a user
   * @param {string} userId - The ID of the user
   * @returns {Promise<number>} The count of unread notifications
   * @throws {Error} If there's an error getting the count
   */
  async getUnreadCount(userId) {
    try {
      const count = await Notification.count({
        where: { userId, isRead: false }
      });
      return count;
    } catch (error) {
      console.error('Error getting unread notification count:', error);
      throw error;
    }
  }

  /**
   * Clear all notifications for a user
   * @param {string} userId - The ID of the user
   * @throws {Error} If there's an error clearing notifications
   */
  async clearAllNotifications(userId) {
    try {
      await Notification.destroy({
        where: { userId }
      });

      this.io.to(`user_${userId}`).emit('notifications_cleared');
    } catch (error) {
      console.error('Error clearing all notifications:', error);
      throw error;
    }
  }

  /**
   * Delete a specific notification
   * @param {string} notificationId - The ID of the notification to delete
   * @param {string} userId - The ID of the user
   * @throws {Error} If the notification is not found or there's an error deleting it
   */
  async deleteNotification(notificationId, userId) {
    try {
      const result = await Notification.destroy({
        where: { id: notificationId, userId }
      });
      if (result === 0) {
        throw new Error('Notification not found or not authorized to delete');
      }

      this.io.to(`user_${userId}`).emit('notification_deleted', notificationId);
    } catch (error) {
      console.error('Error deleting notification:', error);
      throw error;
    }
  }
}

module.exports = NotificationService;