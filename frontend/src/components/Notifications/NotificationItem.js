import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { 
  BellIcon, 
  EyeIcon, 
  ChatBubbleLeftRightIcon,
  TrashIcon
} from '@heroicons/react/24/outline';

const NotificationItem = ({ notification, onMarkAsRead, onViewDetails, onRespond, onDelete }) => {
  const [isExpanded, setIsExpanded] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [quickReply, setQuickReply] = useState('');
  const [hasResponded, setHasResponded] = useState(false);
  const navigate = useNavigate();

  const handleMarkAsRead = () => {
    onMarkAsRead(notification.id);
  };

  const handleViewDetails = () => {
    if (notification.type === 'New chat message') {
      if (notification.exchangeId) {
        navigate(`/chat/${notification.exchangeId}`);
      } else {
        console.error('Exchange ID is missing for chat message notification:', notification);
      }
    } else {
      onViewDetails(notification);
    }
  };

  const handleRespond = async (action) => {
    setIsLoading(true);
    try {
      await onRespond(notification.relatedId, action);
      setHasResponded(true);
    } catch (error) {
      console.error('Failed to respond to exchange request:', error);
      // Handle the error (e.g., show an error message to the user)
    } finally {
      setIsLoading(false);
    }
  };

  const handleDelete = () => {
    onDelete(notification.id);
  };

  const handleQuickReply = async (e) => {
    e.preventDefault();
    if (quickReply.trim()) {
      setIsLoading(true);
      try {
        await onRespond(notification.relatedId, 'reply', quickReply);
        setQuickReply('');
        setIsExpanded(false);
      } catch (error) {
        console.error('Failed to send quick reply:', error);
        // Handle the error (e.g., show an error message to the user)
      } finally {
        setIsLoading(false);
      }
    }
  };

  const getNotificationIcon = () => {
    switch (notification.type) {
      case 'New exchange request':
        return <BellIcon className="h-6 w-6 text-blue-500" />;
      case 'New chat message':
        return <ChatBubbleLeftRightIcon className="h-6 w-6 text-green-500" />;
      default:
        return <BellIcon className="h-6 w-6 text-blue-500" />;
    }
  };

  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`bg-white dark:bg-gray-800 rounded-lg shadow-md p-4 mb-4 ${
        notification.isRead ? 'opacity-75' : ''
      }`}
    >
      <div className="flex justify-between items-start">
        <div className="flex items-center space-x-3">
          {getNotificationIcon()}
          <div>
            <h3 className="text-lg font-semibold text-gray-900 dark:text-white">
              {notification.type}
            </h3>
            <p className="text-sm text-gray-600 dark:text-gray-400">
              {notification.content}
            </p>
          </div>
        </div>
        <div className="flex items-center space-x-2">
          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="text-gray-500 hover:text-gray-700 dark:text-gray-400 dark:hover:text-gray-200"
          >
            <EyeIcon className="h-5 w-5" />
          </button>
          <button
            onClick={handleDelete}
            className="text-red-500 hover:text-red-700 dark:text-red-400 dark:hover:text-red-200"
          >
            <TrashIcon className="h-5 w-5" />
          </button>
        </div>
      </div>
      
      <AnimatePresence>
        {isExpanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-4 space-y-4"
          >
            {notification.type === 'New chat message' && (
              <div className="bg-gray-100 dark:bg-gray-700 p-3 rounded-lg">
                <p className="text-gray-800 dark:text-gray-200">{notification.content}</p>
              </div>
            )}
            <div className="flex flex-col space-y-2">
              <button
                onClick={handleViewDetails}
                className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300"
              >
                {notification.type === 'New chat message' ? 'Go to Chat' : 'View Details'}
              </button>
              {notification.type === 'New exchange request' && !hasResponded && (
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleRespond('accept')}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-green-500 text-white rounded-md hover:bg-green-600 transition duration-300 disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Accept'}
                  </button>
                  <button
                    onClick={() => handleRespond('decline')}
                    disabled={isLoading}
                    className="flex-1 px-4 py-2 bg-red-500 text-white rounded-md hover:bg-red-600 transition duration-300 disabled:opacity-50"
                  >
                    {isLoading ? 'Processing...' : 'Decline'}
                  </button>
                </div>
              )}
              {notification.type === 'New exchange request' && hasResponded && (
                <p className="text-green-500 dark:text-green-400">You have responded to this request.</p>
              )}
              {notification.type === 'New chat message' && (
                <form onSubmit={handleQuickReply} className="flex space-x-2">
                  <input
                    type="text"
                    value={quickReply}
                    onChange={(e) => setQuickReply(e.target.value)}
                    placeholder="Type a quick reply..."
                    className="flex-1 px-3 py-2 bg-gray-100 dark:bg-gray-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <button
                    type="submit"
                    disabled={isLoading || !quickReply.trim()}
                    className="px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600 transition duration-300 disabled:opacity-50"
                  >
                    {isLoading ? 'Sending...' : 'Reply'}
                  </button>
                </form>
              )}
            </div>
            {!notification.isRead && (
              <button
                onClick={handleMarkAsRead}
                className="w-full px-4 py-2 bg-gray-200 text-gray-700 rounded-md hover:bg-gray-300 transition duration-300"
              >
                Mark as Read
              </button>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default NotificationItem;