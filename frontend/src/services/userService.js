import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

const axiosInstance = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

/**
 * User service object containing methods for user-related API calls.
 * @namespace
 */
const userService = {
  /**
   * Fetches the user's profile information.
   * @async
   * @returns {Promise<Object>} The user's profile data.
   * @throws {Error} If there's an error fetching the profile.
   */
  async fetchUserProfile() {
    try {
      const response = await axiosInstance.get('/users/profile');
      return response.data;
    } catch (error) {
      console.error('Error fetching user profile:', error);
      throw error;
    }
  },

  /**
   * Updates the user's avatar.
   * @async
   * @param {File} file - The new avatar file to upload.
   * @returns {Promise<string>} The URL of the updated avatar.
   * @throws {Error} If there's an error updating the avatar.
   */
  async updateAvatar(file) {
    try {
      const formData = new FormData();
      formData.append('avatar', file);
      const response = await axiosInstance.post('/users/avatar', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });
      return response.data.avatar;
    } catch (error) {
      console.error('Error updating avatar:', error);
      throw error;
    }
  },

  /**
   * Updates the user's profile information.
   * @async
   * @param {Object} userData - The updated user data.
   * @returns {Promise<Object>} The updated user profile data.
   * @throws {Error} If there's an error updating the profile.
   */
  async updateUserProfile(userData) {
    try {
      const response = await axiosInstance.put('/users/profile', userData);
      return response.data;
    } catch (error) {
      console.error('Error updating user profile:', error);
      throw error;
    }
  },

  /**
   * Changes the user's password.
   * @async
   * @param {string} currentPassword - The user's current password.
   * @param {string} newPassword - The new password to set.
   * @returns {Promise<Object>} The response data from the password change request.
   * @throws {Error} If there's an error changing the password.
   */
  async changePassword(currentPassword, newPassword) {
    try {
      const response = await axiosInstance.put('/users/change-password', { currentPassword, newPassword });
      return response.data;
    } catch (error) {
      console.error('Error changing password:', error);
      throw error;
    }
  },

  /**
   * Deletes the user's account.
   * @async
   * @returns {Promise<Object>} The response data from the account deletion request.
   * @throws {Error} If there's an error deleting the account.
   */
  async deleteAccount() {
    try {
      const response = await axiosInstance.delete('/users/account');
      return response.data;
    } catch (error) {
      console.error('Error deleting account:', error);
      throw error;
    }
  },

  /**
   * Retrieves the skills a user is interested in.
   * @async
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Array>} An array of skills the user is interested in.
   * @throws {Error} If there's an error fetching the interested skills.
   */
  async getUserInterestedSkills(userId) {
    console.log('userService.getUserInterestedSkills called with userId:', userId);
    try {
      const response = await axiosInstance.get(`/users/${userId}/interested-skills`);
      console.log('Received response from API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in userService.getUserInterestedSkills:', error);
      throw error;
    }
  },

  /**
   * Retrieves the skills a user knows.
   * @async
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Array>} An array of skills the user knows.
   * @throws {Error} If there's an error fetching the known skills.
   */
  async getUserKnownSkills(userId) {
    console.log('userService.getUserKnownSkills called with userId:', userId);
    try {
      const response = await axiosInstance.get(`/users/${userId}/known-skills`);
      console.log('Received response from API:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error in userService.getUserKnownSkills:', error);
      throw error;
    }
  },
};

export default userService;