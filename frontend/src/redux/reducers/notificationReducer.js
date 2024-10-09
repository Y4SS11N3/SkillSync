import {
    FETCH_NOTIFICATIONS_REQUEST,
    FETCH_NOTIFICATIONS_SUCCESS,
    FETCH_NOTIFICATIONS_FAILURE,
    MARK_NOTIFICATION_READ,
    UPDATE_UNREAD_COUNT,
    CLEAR_ALL_NOTIFICATIONS,
    DELETE_NOTIFICATION,
    RECEIVE_NOTIFICATION
  } from '../actions/notificationActions';
  
  const initialState = {
    notifications: [],
    loading: false,
    error: null,
    unreadCount: 0
  };
  
  const notificationReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_NOTIFICATIONS_REQUEST:
        return { ...state, loading: true, error: null };
      case FETCH_NOTIFICATIONS_SUCCESS:
        return { ...state, loading: false, notifications: action.payload };
      case FETCH_NOTIFICATIONS_FAILURE:
        return { ...state, loading: false, error: action.payload };
      case MARK_NOTIFICATION_READ:
        return {
          ...state,
          notifications: state.notifications.map(notification =>
            notification.id === action.payload
              ? { ...notification, isRead: true }
              : notification
          ),
          unreadCount: Math.max(0, state.unreadCount - 1)
        };
      case UPDATE_UNREAD_COUNT:
        return { ...state, unreadCount: action.payload };
      case CLEAR_ALL_NOTIFICATIONS:
        return { ...state, notifications: [], unreadCount: 0 };
      case DELETE_NOTIFICATION:
        return {
          ...state,
          notifications: state.notifications.filter(notification => notification.id !== action.payload),
          unreadCount: state.unreadCount - (state.notifications.find(n => n.id === action.payload && !n.isRead) ? 1 : 0)
        };
        case RECEIVE_NOTIFICATION:
            return {
              ...state,
              notifications: [
                {
                  ...action.payload,
                  exchangeId: action.payload.Exchange ? action.payload.Exchange.id : null
                },
                ...state.notifications
              ],
              unreadCount: state.unreadCount + 1
            };
      default:
        return state;
    }
  };
  
  export default notificationReducer;