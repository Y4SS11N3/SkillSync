const express = require('express');
const NotificationController = require('../controllers/notificationController');
const authMiddleware = require('../middlewares/authMiddleware');

function notificationRoutes(io) {
  const router = express.Router();
  const notificationController = new NotificationController(io);

  router.use(authMiddleware);

  router.get('/', notificationController.getNotifications.bind(notificationController));
  router.put('/:notificationId/read', notificationController.markAsRead.bind(notificationController));
  router.get('/unread-count', notificationController.getUnreadCount.bind(notificationController));
  router.delete('/', notificationController.clearAllNotifications.bind(notificationController));
  router.delete('/:notificationId', notificationController.deleteNotification.bind(notificationController));

  return router;
}

module.exports = notificationRoutes;