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

axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config;
    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;
      try {
        const refreshToken = localStorage.getItem('refreshToken');
        const response = await axios.post(`${API_URL}/auth/refresh-token`, { refreshToken });
        const { accessToken } = response.data;
        localStorage.setItem('accessToken', accessToken);
        axiosInstance.defaults.headers.common['Authorization'] = `Bearer ${accessToken}`;
        return axiosInstance(originalRequest);
      } catch (refreshError) {
        console.error('Error refreshing token:', refreshError);
        return Promise.reject(refreshError);
      }
    }
    return Promise.reject(error);
  }
);

/**
 * Service object containing methods for skill-related API calls.
 * @namespace
 */
const skillService = {
  /**
   * Creates a new skill for a user.
   * @async
   * @param {string} userId - The ID of the user creating the skill.
   * @param {Object} skillData - The data for the new skill.
   * @returns {Promise<Object>} The created skill data.
   * @throws {Error} If there's an error creating the skill.
   */
  async createSkill(userId, skillData) {
    try {
      const response = await axiosInstance.post('/skills', { ...skillData, userId });
      return response.data;
    } catch (error) {
      console.error('Failed to create skill:', error);
      throw new Error(error.response?.data?.message || 'Failed to create skill');
    }
  },

  /**
   * Retrieves skills for a specific user.
   * @async
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Array>} An array of skills associated with the user.
   * @throws {Error} If there's an error fetching the user's skills.
   */
  async getUserSkills(userId) {
    const response = await axiosInstance.get(`/users/${userId}/skills`);
    return response.data;
  },

  /**
   * Retrieves known skills for a specific user.
   * @async
   * @param {string} userId - The ID of the user.
   * @returns {Promise<Array>} An array of known skills associated with the user.
   * @throws {Error} If there's an error fetching the user's known skills.
   */
  async getUserKnownSkills(userId) {
    try {
      const response = await axiosInstance.get(`/users/${userId}/known-skills`);
      return response.data;
    } catch (error) {
      console.error('Error fetching user known skills:', error);
      throw error;
    }
  },
  
  /**
   * Retrieves a specific skill by its ID.
   * @async
   * @param {string} skillId - The ID of the skill to retrieve.
   * @returns {Promise<Object>} The skill data.
   * @throws {Error} If there's an error fetching the skill.
   */
  async getSkill(skillId) {
    try {
      const response = await axiosInstance.get(`/skills/${skillId}`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch skill:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch skill');
    }
  },

  /**
   * Updates a specific skill.
   * @async
   * @param {string} skillId - The ID of the skill to update.
   * @param {Object} updateData - The data to update the skill with.
   * @returns {Promise<Object>} The updated skill data.
   * @throws {Error} If there's an error updating the skill.
   */
  async updateSkill(skillId, updateData) {
    try {
      const response = await axiosInstance.put(`/skills/${skillId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Failed to update skill:', error);
      throw new Error(error.response?.data?.message || 'Failed to update skill');
    }
  },

  /**
   * Deletes a specific skill.
   * @async
   * @param {string} skillId - The ID of the skill to delete.
   * @throws {Error} If there's an error deleting the skill.
   */
  async deleteSkill(skillId) {
    try {
      await axiosInstance.delete(`/skills/${skillId}`);
    } catch (error) {
      console.error('Failed to delete skill:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete skill');
    }
  },

  /**
   * Adds a skill to a user's profile.
   * @async
   * @param {string} userId - The ID of the user.
   * @param {Object} skillData - The data for the skill to add.
   * @returns {Promise<Object>} The added skill data.
   * @throws {Error} If there's an error adding the user skill.
   */
  async addUserSkill(userId, skillData) {
    try {
      const response = await axiosInstance.post('/skills/user-skills', skillData);
      return response.data;
    } catch (error) {
      console.error('Failed to add user skill:', error);
      throw new Error(error.response?.data?.message || 'Failed to add user skill');
    }
  },

  /**
   * Lists skills based on various criteria.
   * @async
   * @param {string} [userId] - The ID of the user (optional).
   * @param {number} [page=1] - The page number for pagination.
   * @param {string} [category='all'] - The category of skills to list.
   * @param {string} [searchTerm=''] - The search term to filter skills.
   * @returns {Promise<Object>} The list of skills and pagination information.
   * @throws {Error} If there's an error fetching the skills.
   */
  async listSkills(userId, page = 1, category = 'all', searchTerm = '') {
    try {
      const params = { 
        page, 
        category: category === 'all' ? undefined : category, 
        searchTerm: searchTerm || undefined 
      };
      if (userId) params.userId = userId;
  
      const response = await axiosInstance.get('/skills/list', { params });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch skills:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch skills');
    }
  },

  /**
   * Retrieves statistics for a specific skill and user.
   * @async
   * @param {string} userId - The ID of the user.
   * @param {string} skillId - The ID of the skill.
   * @returns {Promise<Object|null>} The skill statistics or null if not found.
   * @throws {Error} If there's an error fetching the skill statistics.
   */
  async getSkillStatistics(userId, skillId) {
    if (!skillId) {
      console.log('No skill selected for statistics');
      return null;
    }
    console.log(`Fetching skill statistics for userId: ${userId}, skillId: ${skillId}`);
    try {
      const response = await axiosInstance.get(`/skills/${skillId}/statistics`, {
        params: { userId }
      });
      console.log('Skill statistics fetched successfully:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching skill statistics:', error);
      if (error.response?.status === 404) {
        console.log(`Skill with ID ${skillId} not found for user ${userId}`);
        return null;
      }
      throw error;
    }
  },

  /**
   * Retrieves skill trends for a specific date range.
   * @async
   * @param {string} startDate - The start date for the trend analysis.
   * @param {string} endDate - The end date for the trend analysis.
   * @returns {Promise<Object>} The skill trends data.
   * @throws {Error} If there's an error fetching the skill trends.
   */
  async getSkillTrends(startDate, endDate) {
    try {
      const response = await axiosInstance.get('/skills/trends', {
        params: { startDate, endDate }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to fetch skill trends:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch skill trends');
    }
  },

  /**
   * Retrieves currently trending skills.
   * @async
   * @returns {Promise<Array>} An array of trending skills.
   * @throws {Error} If there's an error fetching trending skills.
   */
  async getTrendingSkills() {
    try {
      const response = await axiosInstance.get('/skills/trending');
      return response.data;
    } catch (error) {
      console.error('Failed to fetch trending skills:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch trending skills');
    }
  },

  /**
   * Deletes a skill from a user's profile.
   * @async
   * @param {string} skillId - The ID of the skill to delete.
   * @throws {Error} If there's an error deleting the user skill.
   */
  async deleteUserSkill(skillId) {
    try {
      await axiosInstance.delete(`/skills/user-skills/${skillId}`);
    } catch (error) {
      console.error('Failed to delete user skill:', error);
      throw new Error(error.response?.data?.message || 'Failed to delete user skill');
    }
  },

  /**
   * Retrieves skills related to a specific skill.
   * @async
   * @param {string} skillId - The ID of the skill to find related skills for.
   * @returns {Promise<Array>} An array of related skills.
   * @throws {Error} If there's an error fetching related skills.
   */
  async getRelatedSkills(skillId) {
    try {
      const response = await axiosInstance.get(`/skills/${skillId}/related`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch related skills:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch related skills');
    }
  },

  /**
   * Retrieves exchange partners for a specific skill.
   * @async
   * @param {string} skillId - The ID of the skill to find exchange partners for.
   * @returns {Promise<Array>} An array of exchange partners.
   * @throws {Error} If there's an error fetching exchange partners.
   */
  async getExchangePartners(skillId) {
    try {
      const response = await axiosInstance.get(`/skills/${skillId}/exchange-partners`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch exchange partners:', error);
      return [];
    }
  },

  /**
   * Retrieves token information for a specific skill.
   * @async
   * @param {string} skillId - The ID of the skill to get token info for.
   * @returns {Promise<Object>} The skill token information.
   * @throws {Error} If there's an error fetching skill token info.
   */
  async getSkillTokenInfo(skillId) {
    try {
      const response = await axiosInstance.get(`/skills/${skillId}/token`);
      return response.data;
    } catch (error) {
      console.error('Failed to fetch skill token info:', error);
      throw new Error(error.response?.data?.message || 'Failed to fetch skill token info');
    }
  },

  /**
   * Performs an advanced search for skills.
   * @async
   * @param {string} userId - The ID of the user performing the search.
   * @param {string} searchTerm - The search term to use in the advanced search.
   * @returns {Promise<Array>} An array of search results.
   * @throws {Error} If there's an error performing the advanced skill search.
   */
  async advancedSkillSearch(userId, searchTerm) {
    try {
      const response = await axiosInstance.get('/exchanges/advanced-search', {
        params: { userId, searchTerm }
      });
      return response.data;
    } catch (error) {
      console.error('Failed to perform advanced skill search:', error);
      throw new Error(error.response?.data?.message || 'Failed to perform advanced skill search');
    }
  },
};

export default skillService;