import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';
import userReducer from './reducers/userReducer';
import skillReducer from './reducers/skillReducer';
import exchangeReducer from './reducers/exchangeReducer';
import dashboardReducer from './reducers/dashboardReducer';
import notificationReducer from './reducers/notificationReducer';

export default configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    skills: skillReducer,
    exchanges: exchangeReducer,
    dashboard: dashboardReducer,
    notifications: notificationReducer,
  },
});