import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';
import userReducer from './reducers/userReducer';

export default configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
  },
});