import axios from 'axios';
import setAuthToken from '../../utils/setAuthToken';

// Action Types
export const LOGIN_SUCCESS = 'LOGIN_SUCCESS';
export const LOGIN_FAIL = 'LOGIN_FAIL';
export const REGISTER_SUCCESS = 'REGISTER_SUCCESS';
export const REGISTER_FAIL = 'REGISTER_FAIL';
export const USER_LOADED = 'USER_LOADED';
export const AUTH_ERROR = 'AUTH_ERROR';
export const LOGOUT = 'LOGOUT';

// API URL
const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Load user data from the server
 * @returns {Function} Thunk function
 */
export const loadUser = () => async (dispatch) => {
  const token = localStorage.getItem('accessToken');
  if (token) {
    setAuthToken(token);
  } else {
    dispatch({ type: AUTH_ERROR });
    return;
  }

  try {
    const res = await axios.get(`${API_URL}/auth/me`);
    const userWithSkills = {
      ...res.data.user,
      skills: res.data.user.Skills || []
    };
    dispatch({
      type: USER_LOADED,
      payload: userWithSkills
    });
  } catch (err) {
    dispatch({ type: AUTH_ERROR });
  }
};

/**
 * Register a new user
 * @param {string} name - User's name
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Function} Thunk function
 */
export const register = (name, email, password) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const body = JSON.stringify({ name, email, password });

  try {
    const res = await axios.post(`${API_URL}/auth/register`, body, config);

    dispatch({
      type: REGISTER_SUCCESS,
      payload: res.data
    });

    setAuthToken(res.data.accessToken);
    dispatch(loadUser());
  } catch (err) {
    dispatch({
      type: REGISTER_FAIL,
      payload: err.response?.data?.error || 'Registration failed'
    });
    throw err;
  }
};

/**
 * Log in a user
 * @param {string} email - User's email
 * @param {string} password - User's password
 * @returns {Function} Thunk function
 */
export const login = (email, password) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const body = JSON.stringify({ email, password });

  try {
    const res = await axios.post(`${API_URL}/auth/login`, body, config);
    localStorage.setItem('accessToken', res.data.accessToken);
    dispatch({
      type: LOGIN_SUCCESS,
      payload: res.data
    });
    setAuthToken(res.data.accessToken);
    dispatch(loadUser());
  } catch (err) {
    dispatch({
      type: LOGIN_FAIL,
      payload: err.response?.data?.error || 'Login failed'
    });
    throw err;
  }
};

/**
 * Log out the current user
 * @returns {Function} Thunk function
 */
export const logout = () => (dispatch) => {
  localStorage.removeItem('accessToken');
  setAuthToken(null);
  dispatch({ type: LOGOUT });
};

/**
 * Submit initial skills for a user
 * @param {Array} skills - Array of initial skills
 * @returns {Function} Thunk function
 */
export const submitInitialSkills = (skills) => async (dispatch) => {
  const config = {
    headers: {
      'Content-Type': 'application/json'
    }
  };

  const body = JSON.stringify({ skills });

  try {
    const res = await axios.post(`${API_URL}/initial-setup/submit-initial-skills`, body, config);
    dispatch({
      type: USER_LOADED,
      payload: res.data.user
    });
    return res.data.user;
  } catch (err) {
    dispatch({
      type: AUTH_ERROR,
      payload: err.response?.data?.error || 'An error occurred while submitting initial skills'
    });
    throw err;
  }
};