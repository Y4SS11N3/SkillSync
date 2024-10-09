import axios from 'axios';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000/api';

/**
 * Generates the authorization header for API requests.
 * @returns {Object} The authorization header object.
 */
const authHeader = () => {
  const token = localStorage.getItem('accessToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

/**
 * Fetches dashboard data from the API.
 * @async
 * @returns {Promise<Object>} The dashboard data.
 * @throws {Error} If there's an error fetching the data or if unauthorized.
 */
export const fetchDashboardData = async () => {
  try {
    const response = await axios.get(`${API_URL}/dashboard`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    if (error.response && error.response.status === 401) {
      throw new Error('Unauthorized access. Please log in again.');
    }
    throw error;
  }
};

/**
 * Fetches user skills from the API.
 * @async
 * @returns {Promise<Object>} The user skills data.
 * @throws {Error} If there's an error fetching the data.
 */
export const fetchUserSkills = async () => {
  try {
    const response = await axios.get(`${API_URL}/skills/user`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching user skills:', error);
    throw error;
  }
};

/**
 * Fetches exchange history from the API.
 * @async
 * @returns {Promise<Object>} The exchange history data.
 * @throws {Error} If there's an error fetching the data.
 */
export const fetchExchangeHistory = async () => {
  try {
    const response = await axios.get(`${API_URL}/exchanges/history`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching exchange history:', error);
    throw error;
  }
};

/**
 * Fetches user reputation from the API.
 * @async
 * @returns {Promise<Object>} The user reputation data.
 * @throws {Error} If there's an error fetching the data.
 */
export const fetchUserReputation = async () => {
  try {
    const response = await axios.get(`${API_URL}/reputation`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching user reputation:', error);
    throw error;
  }
};

/**
 * Fetches skill matches from the API.
 * @async
 * @returns {Promise<Object>} The skill matches data.
 * @throws {Error} If there's an error fetching the data.
 */
export const fetchSkillMatches = async () => {
  try {
    const response = await axios.get(`${API_URL}/skill-matches`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching skill matches:', error);
    throw error;
  }
};

/**
 * Fetches upcoming exchanges from the API.
 * @async
 * @returns {Promise<Object>} The upcoming exchanges data.
 * @throws {Error} If there's an error fetching the data.
 */
export const fetchUpcomingExchanges = async () => {
  try {
    const response = await axios.get(`${API_URL}/upcoming-exchanges`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching upcoming exchanges:', error);
    throw error;
  }
};

/**
 * Fetches global skill demand data from the API.
 * @async
 * @returns {Promise<Object>} The global skill demand data.
 * @throws {Error} If there's an error fetching the data.
 */
export const fetchGlobalSkillDemand = async () => {
  try {
    const response = await axios.get(`${API_URL}/exchanges/global-skill-demand`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching global skill demand:', error);
    throw error;
  }
};

/**
 * Fetches personalized recommendations from the API.
 * @async
 * @returns {Promise<Object>} The personalized recommendations data.
 * @throws {Error} If there's an error fetching the data.
 */
export const fetchPersonalizedRecommendations = async () => {
  try {
    const response = await axios.get(`${API_URL}/personalized-recommendations`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    throw error;
  }
};

/**
 * Fetches user achievements from the API.
 * @async
 * @returns {Promise<Object>} The user achievements data.
 * @throws {Error} If there's an error fetching the data.
 */
export const fetchAchievements = async () => {
  try {
    const response = await axios.get(`${API_URL}/achievements`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching achievements:', error);
    throw error;
  }
};

/**
 * Fetches learning goals from the API.
 * @async
 * @returns {Promise<Object>} The learning goals data.
 * @throws {Error} If there's an error fetching the data.
 */
export const fetchLearningGoals = async () => {
  try {
    const response = await axios.get(`${API_URL}/learning-goals`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching learning goals:', error);
    throw error;
  }
};

/**
 * Creates a new review.
 * @async
 * @param {Object} reviewData - The data for the new review.
 * @returns {Promise<Object>} The created review data.
 * @throws {Error} If there's an error creating the review.
 */
export const createReview = async (reviewData) => {
  try {
    const response = await axios.post(`${API_URL}/reviews/create`, reviewData, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error creating review:', error);
    throw error;
  }
};

/**
 * Fetches user reviews for a specific user.
 * @async
 * @param {string} userId - The ID of the user to fetch reviews for.
 * @returns {Promise<Object>} The user reviews data.
 * @throws {Error} If there's an error fetching the reviews.
 */
export const fetchUserReviews = async (userId) => {
  try {
    const response = await axios.get(`${API_URL}/reviews/user/${userId}`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching user reviews:', error);
    throw error;
  }
};

/**
 * Fetches details for a specific skill.
 * @async
 * @param {string} skillId - The ID of the skill to fetch details for.
 * @returns {Promise<Object>} The skill details data.
 * @throws {Error} If there's an error fetching the skill details.
 */
export const fetchSkillDetails = async (skillId) => {
  try {
    const response = await axios.get(`${API_URL}/skills/${skillId}/details`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching skill details:', error);
    throw error;
  }
};

/**
 * Adds a skill to the user's learning goals.
 * @async
 * @param {string} skillId - The ID of the skill to add to learning goals.
 * @returns {Promise<Object>} The updated learning goals data.
 * @throws {Error} If there's an error adding the skill to learning goals.
 */
export const addToLearningGoals = async (skillId) => {
  try {
    const response = await axios.post(`${API_URL}/learning-goals/add`, { skillId }, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error adding to learning goals:', error);
    throw error;
  }
};

/**
 * Initiates a skill exchange.
 * @async
 * @param {string} skillId - The ID of the skill for the exchange.
 * @returns {Promise<Object>} The initiated skill exchange data.
 * @throws {Error} If there's an error initiating the skill exchange.
 */
export const initiateSkillExchange = async (skillId) => {
  try {
    const response = await axios.post(`${API_URL}/exchanges/initiate`, { skillId }, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error initiating skill exchange:', error);
    throw error;
  }
};

/**
 * Fetches suggested matches for a skill.
 * @async
 * @param {string} skillId - The ID of the skill to fetch suggested matches for.
 * @returns {Promise<Object>} The suggested matches data.
 * @throws {Error} If there's an error fetching suggested matches.
 */
export const fetchSuggestedMatches = async (skillId) => {
  try {
    const response = await axios.get(`${API_URL}/exchanges/suggest-matches?skillId=${skillId}`, { headers: authHeader() });
    return response.data;
  } catch (error) {
    console.error('Error fetching suggested matches:', error);
    throw error;
  }
};