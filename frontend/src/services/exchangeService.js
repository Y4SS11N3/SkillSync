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
 * Service object containing methods for exchange-related API calls.
 * @namespace
 */
const exchangeService = {
  /**
   * Creates a new exchange request.
   * @async
   * @param {string} providerId - The ID of the skill provider.
   * @param {string} skillId - The ID of the skill being exchanged.
   * @param {number} duration - The duration of the exchange in minutes.
   * @param {string} proposedTime - The proposed time for the exchange.
   * @returns {Promise<Object>} The created exchange request data.
   * @throws {Error} If there's an error creating the exchange request.
   */
  async createExchangeRequest(providerId, skillId, duration, proposedTime) {
    try {
      const response = await axiosInstance.post('/exchanges/request', {
        providerId,
        skillId,
        duration,
        proposedTime
      });
      return response.data;
    } catch (error) {
      console.error('Failed to create exchange request:', error);
      throw new Error(error.response?.data?.message || 'Failed to create exchange request');
    }
  },

  /**
   * Fetches exchange analytics.
   * @async
   * @returns {Promise<Object>} The exchange analytics data.
   * @throws {Error} If there's an error fetching exchange analytics.
   */
  async getExchangeAnalytics() {
    try {
      const response = await axiosInstance.get('/exchanges/analytics');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch exchange analytics:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch exchange analytics');
    }
  },

  /**
   * Lists exchanges based on their status.
   * @async
   * @param {string} status - The status of exchanges to list.
   * @returns {Promise<Array>} An array of exchanges.
   * @throws {Error} If there's an error listing exchanges.
   */
  async listExchanges(status) {
    try {
      const response = await axiosInstance.get('/exchanges', { params: { status } });
      return response.data;
    } catch (error) {
      console.error('Failed to list exchanges:', error);
      throw new Error(error.response?.data?.message || 'Failed to list exchanges');
    }
  },

  /**
   * Fetches a specific exchange by ID.
   * @async
   * @param {string} exchangeId - The ID of the exchange to fetch.
   * @returns {Promise<Object>} The exchange data.
   * @throws {Error} If there's an error fetching the exchange.
   */
  async getExchange(exchangeId) {
    try {
      const response = await axiosInstance.get(`/exchanges/${exchangeId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch exchange:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch exchange');
    }
  },

  /**
   * Responds to an exchange request.
   * @async
   * @param {string} exchangeId - The ID of the exchange request.
   * @param {string} action - The action to take (e.g., 'accept' or 'reject').
   * @returns {Promise<Object>} The updated exchange data.
   * @throws {Error} If there's an error responding to the exchange request.
   */
  async respondToExchangeRequest(exchangeId, action) {
    try {
      const response = await axiosInstance.post(`/exchanges/${exchangeId}/respond`, { action });
      return response.data;
    } catch (error) {
      console.error('Failed to respond to exchange request:', error);
      throw new Error(error.response?.data?.message || 'Failed to respond to exchange request');
    }
  },

  /**
   * Cancels an exchange.
   * @async
   * @param {string} exchangeId - The ID of the exchange to cancel.
   * @returns {Promise<Object>} The cancelled exchange data.
   * @throws {Error} If there's an error cancelling the exchange.
   */
  async cancelExchange(exchangeId) {
    try {
      const response = await axiosInstance.post(`/exchanges/${exchangeId}/cancel`);
      return response.data;
    } catch (error) {
      console.error('Failed to cancel exchange:', error);
      throw new Error(error.response?.data?.message || 'Failed to cancel exchange');
    }
  },

  /**
   * Completes an exchange.
   * @async
   * @param {string} exchangeId - The ID of the exchange to complete.
   * @param {number} rating - The rating given for the exchange.
   * @param {string} feedback - The feedback provided for the exchange.
   * @returns {Promise<Object>} The completed exchange data.
   * @throws {Error} If there's an error completing the exchange.
   */
  async completeExchange(exchangeId, rating, feedback) {
    try {
      const response = await axiosInstance.post(`/exchanges/${exchangeId}/complete`, { rating, feedback });
      return response.data;
    } catch (error) {
      console.error('Failed to complete exchange:', error);
      throw new Error(error.response?.data?.message || 'Failed to complete exchange');
    }
  },

  /**
   * Connects users for an exchange.
   * @async
   * @param {Object} exchangeRequest - The exchange request data.
   * @returns {Promise<Object>} The connected exchange data.
   * @throws {Error} If there's an error connecting for the exchange.
   */
  async connectForExchange(exchangeRequest) {
    try {
      const response = await axiosInstance.post('/exchanges/connect', exchangeRequest);
      return response.data;
    } catch (error) {
      console.error('Failed to connect for exchange:', error);
      throw new Error(error.response?.data?.message || 'Failed to connect for exchange');
    }
  },

  /**
   * Performs an advanced skill search.
   * @async
   * @param {string} userId - The ID of the user performing the search.
   * @param {string} searchTerm - The search term.
   * @param {Object} filters - Additional filters for the search.
   * @returns {Promise<Array>} An array of search results.
   * @throws {Error} If there's an error performing the advanced skill search.
   */
  async advancedSkillSearch(userId, searchTerm, filters) {
    try {
      const response = await axiosInstance.get('/exchanges/advanced-search', {
        params: { userId, searchTerm, ...filters }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to perform advanced skill search:', error);
      throw new Error(error.response?.data?.message || 'Failed to perform advanced skill search');
    }
  },

  /**
   * Creates a review for an exchange.
   * @async
   * @param {string} exchangeId - The ID of the exchange.
   * @param {number} rating - The rating given for the exchange.
   * @param {string} comment - The comment provided for the exchange.
   * @returns {Promise<Object>} The created review data.
   * @throws {Error} If there's an error creating the review.
   */
  async createReview(exchangeId, rating, comment) {
    try {
      const response = await axiosInstance.post(`/exchanges/${exchangeId}/review`, { rating, comment });
      return response.data;
    } catch (error) {
      console.error('Failed to create review:', error);
      throw new Error(error.response?.data?.message || 'Failed to create review');
    }
  },

  /**
   * Fetches reviews for a specific user.
   * @async
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Array>} An array of reviews for the user.
   * @throws {Error} If there's an error fetching the reviews.
   */
  async getReviewsForUser(userId) {
    try {
      const response = await axiosInstance.get(`/exchanges/user/${userId}/reviews`);
      return response.data;
    } catch (error) {
      console.error('Failed to get reviews for user:', error);
      throw new Error(error.response?.data?.message || 'Failed to get reviews for user');
    }
  },

  /**
   * Fetches reviews for a specific exchange.
   * @async
   * @param {string} exchangeId - The ID of the exchange.
   * @returns {Promise<Array>} An array of reviews for the exchange.
   * @throws {Error} If there's an error fetching the reviews.
   */
  async getReviewsForExchange(exchangeId) {
    try {
      const response = await axiosInstance.get(`/exchanges/${exchangeId}/reviews`);
      return response.data;
    } catch (error) {
      console.error('Failed to get reviews for exchange:', error);
      throw new Error(error.response?.data?.message || 'Failed to get reviews for exchange');
    }
  },

  /**
   * Updates an existing review.
   * @async
   * @param {string} reviewId - The ID of the review to update.
   * @param {number} rating - The updated rating.
   * @param {string} comment - The updated comment.
   * @returns {Promise<Object>} The updated review data.
   * @throws {Error} If there's an error updating the review.
   */
  async updateReview(reviewId, rating, comment) {
    try {
      const response = await axiosInstance.put(`/exchanges/review/${reviewId}`, { rating, comment });
      return response.data;
    } catch (error) {
      console.error('Failed to update review:', error);
      throw new Error(error.response?.data?.message || 'Failed to update review');
    }
  },

  /**
   * Deletes a review.
   * @async
   * @param {string} reviewId - The ID of the review to delete.
   * @returns {Promise<Object>} The response data from the server.
   * @throws {Error} If there's an error deleting the review.
   */
  async deleteReview(reviewId) {
    try {
      const response = await axiosInstance.delete(`/exchanges/review/${reviewId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to delete review:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete review');
    }
  },
};

export default exchangeService;