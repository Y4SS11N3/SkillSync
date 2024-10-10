import React, { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  fetchNotifications, 
  markNotificationAsRead, 
  updateUnreadCount, 
  clearAllNotifications,
  deleteNotification,
  receiveNotification
} from '../../redux/actions/notificationActions';
import { respondToExchange } from '../../redux/actions/exchangeActions';
import { sendMessage } from '../../redux/actions/chatActions';
import notificationService from '../../services/notificationService';
import NotificationItem from './NotificationItem';

const NotificationList = () => {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { notifications, loading, error } = useSelector(state => state.notifications);
  const { user } = useSelector(state => state.auth);

  useEffect(() => {
    dispatch(fetchNotifications());

    // Set up real-time notifications
    if (user) {
      notificationService.joinUserRoom(user.id);
      notificationService.onNewNotification((newNotification) => {
        dispatch(receiveNotification(newNotification));
        dispatch(updateUnreadCount());
      });
    }

    return () => {
      if (user) {
        notificationService.offNewNotification();
      }
    };
  }, [dispatch, user]);

  const handleMarkAsRead = (notificationId) => {
    dispatch(markNotificationAsRead(notificationId)).then(() => {
      dispatch(updateUnreadCount());
    });
  };

  const handleViewDetails = (notification) => {
    if (notification.type === 'New chat message') {
      navigate(`/chat/${notification.relatedId}`);
    } else {
      // Here you can implement a modal or a separate page to show exchange details
      console.log('View details for notification:', notification);
    }
  };

  const handleRespond = (exchangeId, action, message = null) => {
    if (action === 'reply') {
      return dispatch(sendMessage(exchangeId, message)).then(() => {
        dispatch(fetchNotifications());
        dispatch(updateUnreadCount());
      });
    } else {
      return dispatch(respondToExchange(exchangeId, action)).then(() => {
        dispatch(fetchNotifications());
        dispatch(updateUnreadCount());
      });
    }
  };

  const handleClearAll = () => {
    dispatch(clearAllNotifications()).then(() => {
      dispatch(updateUnreadCount());
    });
  };

  const handleDeleteNotification = (notificationId) => {
    dispatch(deleteNotification(notificationId)).then(() => {
      dispatch(updateUnreadCount());
    });
  };

  if (loading) return <div className="text-center py-4">Loading notifications...</div>;
  if (error) return <div className="text-center py-4 text-red-500">Error: {error}</div>;

  return (
    <div className="notification-list max-w-3xl mx-auto">
      <div className="flex justify-between items-center mb-6">
        <h2 className="text-2xl font-bold text-gray-900 dark:text-white">Notifications</h2>
        {notifications.length > 0 && (
          <button
            onClick={handleClearAll}
            className="px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300"
          >
            Clear All
          </button>
        )}
      </div>
      <AnimatePresence>
        {notifications.length === 0 ? (
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="text-center py-4 text-gray-500"
          >
            No notifications
          </motion.p>
        ) : (
          notifications.map(notification => (
            <NotificationItem
              key={notification.id}
              notification={notification}
              onMarkAsRead={handleMarkAsRead}
              onViewDetails={handleViewDetails}
              onRespond={handleRespond}
              onDelete={handleDeleteNotification}
            />
          ))
        )}
      </AnimatePresence>
    </div>
  );
};

export default NotificationList;