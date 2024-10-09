import { configureStore } from '@reduxjs/toolkit';
import authReducer from './reducers/authReducer';
import userReducer from './reducers/userReducer';
import skillReducer from './reducers/skillReducer';
import exchangeReducer from './reducers/exchangeReducer';

export default configureStore({
  reducer: {
    auth: authReducer,
    user: userReducer,
    skills: skillReducer,
    exchanges: exchangeReducer,
  },
});