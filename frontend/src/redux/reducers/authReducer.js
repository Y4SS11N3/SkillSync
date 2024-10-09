import {
    REGISTER_SUCCESS,
    REGISTER_FAIL,
    USER_LOADED,
    AUTH_ERROR,
    LOGIN_SUCCESS,
    LOGIN_FAIL,
    LOGOUT
  } from '../actions/authActions';
  
  const initialState = {
    token: localStorage.getItem('accessToken'),
    isAuthenticated: null,
    loading: true,
    user: null,
    initialSetupComplete: false
  };
  
  export default function(state = initialState, action) {
    const { type, payload } = action;
  
    switch (type) {
      case USER_LOADED:
        return {
          ...state,
          isAuthenticated: true,
          loading: false,
          user: payload,
          initialSetupComplete: payload.initialSetupComplete
        };
      
      
      case REGISTER_SUCCESS:
      case LOGIN_SUCCESS:
        localStorage.setItem('accessToken', payload.accessToken);
        return {
          ...state,
          ...payload,
          isAuthenticated: true,
          loading: false
        };
      case REGISTER_FAIL:
      case AUTH_ERROR:
      case LOGIN_FAIL:
      case LOGOUT:
        localStorage.removeItem('accessToken');
        return {
          ...state,
          token: null,
          isAuthenticated: false,
          loading: false,
          user: null
        };
      default:
        return state;
    }
  }