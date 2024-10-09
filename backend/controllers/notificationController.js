const NotificationService = require('../services/notificationService');

/**
 * Controller for handling notification-related operations.
 * @class NotificationController
 */
class NotificationController {
  /**
   * Creates an instance of NotificationController.
   * @param {Object} io - Socket.io instance for real-time notifications.
   */
  constructor(io) {
    this.notificationService = new NotificationService(io);
  }

  /**
   * Retrieves notifications for a user.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      const notifications = await this.notificationService.getNotifications(userId);
      res.json(notifications);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Marks a notification as read.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async markAsRead(req, res, next) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;
      const notification = await this.notificationService.markAsRead(notificationId, userId);
      res.json(notification);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Retrieves the count of unread notifications for a user.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getUnreadCount(req, res, next) {
    try {
      const userId = req.user.id;
      const count = await this.notificationService.getUnreadCount(userId);
      res.json({ count });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Clears all notifications for a user.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async clearAllNotifications(req, res, next) {
    try {
      const userId = req.user.id;
      await this.notificationService.clearAllNotifications(userId);
      res.json({ message: 'All notifications cleared successfully' });
    } catch (error) {
      next(error);
    }
  }

  /**
   * Deletes a specific notification for a user.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteNotification(req, res, next) {
    try {
      const { notificationId } = req.params;
      const userId = req.user.id;
      await this.notificationService.deleteNotification(notificationId, userId);
      res.json({ message: 'Notification deleted successfully' });
    } catch (error) {
      next(error);
    }
  }
}

module.exports = NotificationController;