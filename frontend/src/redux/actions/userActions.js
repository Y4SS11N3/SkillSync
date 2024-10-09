import userService from '../../services/userService';

// Action Types
export const FETCH_USER_DATA_REQUEST = 'FETCH_USER_DATA_REQUEST';
export const FETCH_USER_DATA_SUCCESS = 'FETCH_USER_DATA_SUCCESS';
export const FETCH_USER_DATA_FAILURE = 'FETCH_USER_DATA_FAILURE';
export const UPDATE_AVATAR_REQUEST = 'UPDATE_AVATAR_REQUEST';
export const UPDATE_AVATAR_SUCCESS = 'UPDATE_AVATAR_SUCCESS';
export const UPDATE_AVATAR_FAILURE = 'UPDATE_AVATAR_FAILURE';
export const UPDATE_PROFILE_REQUEST = 'UPDATE_PROFILE_REQUEST';
export const UPDATE_PROFILE_SUCCESS = 'UPDATE_PROFILE_SUCCESS';
export const UPDATE_PROFILE_FAILURE = 'UPDATE_PROFILE_FAILURE';
export const FETCH_USER_INTERESTED_SKILLS_REQUEST = 'FETCH_USER_INTERESTED_SKILLS_REQUEST';
export const FETCH_USER_INTERESTED_SKILLS_SUCCESS = 'FETCH_USER_INTERESTED_SKILLS_SUCCESS';
export const FETCH_USER_INTERESTED_SKILLS_FAILURE = 'FETCH_USER_INTERESTED_SKILLS_FAILURE';
export const FETCH_USER_KNOWN_SKILLS_REQUEST = 'FETCH_USER_KNOWN_SKILLS_REQUEST';
export const FETCH_USER_KNOWN_SKILLS_SUCCESS = 'FETCH_USER_KNOWN_SKILLS_SUCCESS';
export const FETCH_USER_KNOWN_SKILLS_FAILURE = 'FETCH_USER_KNOWN_SKILLS_FAILURE';

/**
 * Fetches user data from the server
 * @returns {Function} Thunk function
 */
export const fetchUserData = () => async (dispatch) => {
  dispatch({ type: FETCH_USER_DATA_REQUEST });
  try {
    const userData = await userService.fetchUserProfile();
    dispatch({ type: FETCH_USER_DATA_SUCCESS, payload: userData });
    return userData;
  } catch (error) {
    console.error('Error fetching user data:', error);
    dispatch({ 
      type: FETCH_USER_DATA_FAILURE, 
      payload: error.response?.data?.message || error.message 
    });
    if (error.response && error.response.status === 401) {
      localStorage.removeItem('token');
      dispatch({ type: 'LOGOUT' });
    }
    throw error;
  }
};

/**
 * Updates the user's avatar
 * @param {File} file - The new avatar file
 * @returns {Function} Thunk function
 */
export const updateAvatar = (file) => async (dispatch) => {
  dispatch({ type: UPDATE_AVATAR_REQUEST });
  try {
    const avatarUrl = await userService.updateAvatar(file);
    dispatch({ type: UPDATE_AVATAR_SUCCESS, payload: avatarUrl });
    dispatch(fetchUserData());
    return avatarUrl;
  } catch (error) {
    console.error('Error updating avatar:', error);
    dispatch({ 
      type: UPDATE_AVATAR_FAILURE, 
      payload: error.response?.data?.message || error.message 
    });
    throw error;
  }
};

/**
 * Updates the user's profile information
 * @param {Object} userData - The updated user data
 * @returns {Function} Thunk function
 */
export const updateUserProfile = (userData) => async (dispatch) => {
  dispatch({ type: UPDATE_PROFILE_REQUEST });
  try {
    const updatedProfile = await userService.updateUserProfile(userData);
    dispatch({ type: UPDATE_PROFILE_SUCCESS, payload: updatedProfile });
    return updatedProfile;
  } catch (error) {
    console.error('Error updating user profile:', error);
    dispatch({ 
      type: UPDATE_PROFILE_FAILURE, 
      payload: error.response?.data?.message || error.message 
    });
    throw error;
  }
};

/**
 * Fetches the user's interested skills
 * @param {string} userId - The ID of the user
 * @returns {Function} Thunk function
 */
export const fetchUserInterestedSkills = (userId) => async (dispatch) => {
  dispatch({ type: FETCH_USER_INTERESTED_SKILLS_REQUEST });
  try {
    const interestedSkills = await userService.getUserInterestedSkills(userId);
    dispatch({ type: FETCH_USER_INTERESTED_SKILLS_SUCCESS, payload: interestedSkills });
    return interestedSkills;
  } catch (error) {
    console.error('Error in fetchUserInterestedSkills action:', error);
    dispatch({ type: FETCH_USER_INTERESTED_SKILLS_FAILURE, payload: error.message });
    throw error;
  }
};

/**
 * Fetches the user's known skills
 * @param {string} userId - The ID of the user
 * @returns {Function} Thunk function
 */
export const fetchUserKnownSkills = (userId) => async (dispatch) => {
  dispatch({ type: FETCH_USER_KNOWN_SKILLS_REQUEST });
  try {
    const knownSkills = await userService.getUserKnownSkills(userId);
    dispatch({ type: FETCH_USER_KNOWN_SKILLS_SUCCESS, payload: knownSkills });
    return knownSkills;
  } catch (error) {
    console.error('Error in fetchUserKnownSkills action:', error);
    dispatch({ type: FETCH_USER_KNOWN_SKILLS_FAILURE, payload: error.message });
    throw error;
  }
};