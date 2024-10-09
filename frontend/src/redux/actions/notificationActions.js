import notificationService from '../../services/notificationService';

// Action Types
export const FETCH_NOTIFICATIONS_REQUEST = 'FETCH_NOTIFICATIONS_REQUEST';
export const FETCH_NOTIFICATIONS_SUCCESS = 'FETCH_NOTIFICATIONS_SUCCESS';
export const FETCH_NOTIFICATIONS_FAILURE = 'FETCH_NOTIFICATIONS_FAILURE';
export const MARK_NOTIFICATION_READ = 'MARK_NOTIFICATION_READ';
export const UPDATE_UNREAD_COUNT = 'UPDATE_UNREAD_COUNT';
export const CLEAR_ALL_NOTIFICATIONS = 'CLEAR_ALL_NOTIFICATIONS';
export const DELETE_NOTIFICATION = 'DELETE_NOTIFICATION';
export const RECEIVE_NOTIFICATION = 'RECEIVE_NOTIFICATION';
export const INITIALIZE_SOCKET = 'INITIALIZE_SOCKET';

/**
 * Initializes the WebSocket connection for real-time notifications
 * @param {string} token - Authentication token
 * @returns {Function} Thunk function
 */
export const initializeSocket = (token) => async (dispatch) => {
  try {
    const socket = await notificationService.initSocket(token);
    dispatch({ type: INITIALIZE_SOCKET, payload: { connected: true } });
    return socket;
  } catch (error) {
    console.error('Error initializing socket:', error);
    dispatch({ type: INITIALIZE_SOCKET, payload: { connected: false } });
    throw error;
  }
};

/**
 * Joins the user-specific room for targeted notifications
 * @param {string} userId - ID of the user
 * @returns {Function} Thunk function
 */
export const joinUserRoom = (userId) => (dispatch) => {
  notificationService.joinUserRoom(userId);
};

/**
 * Fetches all notifications for the current user
 * @returns {Function} Thunk function
 */
export const fetchNotifications = () => async (dispatch) => {
  dispatch({ type: FETCH_NOTIFICATIONS_REQUEST });
  try {
    const notifications = await notificationService.getNotifications();
    dispatch({ type: FETCH_NOTIFICATIONS_SUCCESS, payload: notifications });
  } catch (error) {
    dispatch({ type: FETCH_NOTIFICATIONS_FAILURE, payload: error.message });
  }
};

/**
 * Marks a specific notification as read
 * @param {string} notificationId - ID of the notification to mark as read
 * @returns {Function} Thunk function
 */
export const markNotificationAsRead = (notificationId) => async (dispatch) => {
  try {
    await notificationService.markAsRead(notificationId);
    dispatch({ type: MARK_NOTIFICATION_READ, payload: notificationId });
    dispatch(updateUnreadCount());
  } catch (error) {
    console.error('Error marking notification as read:', error);
  }
};

/**
 * Updates the count of unread notifications
 * @returns {Function} Thunk function
 */
export const updateUnreadCount = () => async (dispatch) => {
  try {
    const count = await notificationService.getUnreadCount();
    dispatch({ type: UPDATE_UNREAD_COUNT, payload: count });
  } catch (error) {
    console.error('Error updating unread count:', error);
  }
};

/**
 * Clears all notifications for the current user
 * @returns {Function} Thunk function
 */
export const clearAllNotifications = () => async (dispatch) => {
  try {
    await notificationService.clearAllNotifications();
    dispatch({ type: CLEAR_ALL_NOTIFICATIONS });
    dispatch(updateUnreadCount());
  } catch (error) {
    console.error('Error clearing notifications:', error);
  }
};

/**
 * Deletes a specific notification
 * @param {string} notificationId - ID of the notification to delete
 * @returns {Function} Thunk function
 */
export const deleteNotification = (notificationId) => async (dispatch) => {
  try {
    await notificationService.deleteNotification(notificationId);
    dispatch({ type: DELETE_NOTIFICATION, payload: notificationId });
    dispatch(updateUnreadCount());
  } catch (error) {
    console.error('Error deleting notification:', error);
  }
};

/**
 * Action creator for receiving a new notification
 * @param {Object} notification - The received notification object
 * @returns {Object} Action object
 */
export const receiveNotification = (notification) => ({
  type: RECEIVE_NOTIFICATION,
  payload: notification,
});