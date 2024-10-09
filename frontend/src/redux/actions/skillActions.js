import skillService from '../../services/skillService';

// Action Types
export const FETCH_SKILLS_REQUEST = 'FETCH_SKILLS_REQUEST';
export const FETCH_SKILLS_SUCCESS = 'FETCH_SKILLS_SUCCESS';
export const FETCH_SKILLS_FAILURE = 'FETCH_SKILLS_FAILURE';
export const GET_SKILL_REQUEST = 'GET_SKILL_REQUEST';
export const GET_SKILL_SUCCESS = 'GET_SKILL_SUCCESS';
export const GET_SKILL_FAILURE = 'GET_SKILL_FAILURE';
export const CREATE_SKILL_REQUEST = 'CREATE_SKILL_REQUEST';
export const CREATE_SKILL_SUCCESS = 'CREATE_SKILL_SUCCESS';
export const CREATE_SKILL_FAILURE = 'CREATE_SKILL_FAILURE';
export const UPDATE_SKILL_REQUEST = 'UPDATE_SKILL_REQUEST';
export const UPDATE_SKILL_SUCCESS = 'UPDATE_SKILL_SUCCESS';
export const UPDATE_SKILL_FAILURE = 'UPDATE_SKILL_FAILURE';
export const DELETE_SKILL_REQUEST = 'DELETE_SKILL_REQUEST';
export const DELETE_SKILL_SUCCESS = 'DELETE_SKILL_SUCCESS';
export const DELETE_SKILL_FAILURE = 'DELETE_SKILL_FAILURE';
export const GET_SKILL_TOKEN_INFO_REQUEST = 'GET_SKILL_TOKEN_INFO_REQUEST';
export const GET_SKILL_TOKEN_INFO_SUCCESS = 'GET_SKILL_TOKEN_INFO_SUCCESS';
export const GET_SKILL_TOKEN_INFO_FAILURE = 'GET_SKILL_TOKEN_INFO_FAILURE';
export const GET_SKILL_HEATMAP_REQUEST = 'GET_SKILL_HEATMAP_REQUEST';
export const GET_SKILL_HEATMAP_SUCCESS = 'GET_SKILL_HEATMAP_SUCCESS';
export const GET_SKILL_HEATMAP_FAILURE = 'GET_SKILL_HEATMAP_FAILURE';
export const GET_SKILL_TRENDS_REQUEST = 'GET_SKILL_TRENDS_REQUEST';
export const GET_SKILL_TRENDS_SUCCESS = 'GET_SKILL_TRENDS_SUCCESS';
export const GET_SKILL_TRENDS_FAILURE = 'GET_SKILL_TRENDS_FAILURE';
export const GET_RELATED_SKILLS_REQUEST = 'GET_RELATED_SKILLS_REQUEST';
export const GET_RELATED_SKILLS_SUCCESS = 'GET_RELATED_SKILLS_SUCCESS';
export const GET_RELATED_SKILLS_FAILURE = 'GET_RELATED_SKILLS_FAILURE';
export const GET_SKILL_STATISTICS_REQUEST = 'GET_SKILL_STATISTICS_REQUEST';
export const GET_SKILL_STATISTICS_SUCCESS = 'GET_SKILL_STATISTICS_SUCCESS';
export const GET_SKILL_STATISTICS_FAILURE = 'GET_SKILL_STATISTICS_FAILURE';
export const GET_TOP_SKILLS_IN_AREA_REQUEST = 'GET_TOP_SKILLS_IN_AREA_REQUEST';
export const GET_TOP_SKILLS_IN_AREA_SUCCESS = 'GET_TOP_SKILLS_IN_AREA_SUCCESS';
export const GET_TOP_SKILLS_IN_AREA_FAILURE = 'GET_TOP_SKILLS_IN_AREA_FAILURE';
export const CLEAR_SEARCH_RESULTS = 'CLEAR_SEARCH_RESULTS';
export const SET_SELECTED_SKILL = 'SET_SELECTED_SKILL';
export const INITIATE_SKILL_EXCHANGE_REQUEST = 'INITIATE_SKILL_EXCHANGE_REQUEST';
export const INITIATE_SKILL_EXCHANGE_SUCCESS = 'INITIATE_SKILL_EXCHANGE_SUCCESS';
export const INITIATE_SKILL_EXCHANGE_FAILURE = 'INITIATE_SKILL_EXCHANGE_FAILURE';
export const FETCH_USER_SKILLS_REQUEST = 'FETCH_USER_SKILLS_REQUEST';
export const FETCH_USER_SKILLS_SUCCESS = 'FETCH_USER_SKILLS_SUCCESS';
export const FETCH_USER_SKILLS_FAILURE = 'FETCH_USER_SKILLS_FAILURE';
export const GET_TRENDING_SKILLS_REQUEST = 'GET_TRENDING_SKILLS_REQUEST';
export const GET_TRENDING_SKILLS_SUCCESS = 'GET_TRENDING_SKILLS_SUCCESS';
export const GET_TRENDING_SKILLS_FAILURE = 'GET_TRENDING_SKILLS_FAILURE';
export const SEARCH_SKILLS_REQUEST = 'SEARCH_SKILLS_REQUEST';
export const SEARCH_SKILLS_SUCCESS = 'SEARCH_SKILLS_SUCCESS';
export const SEARCH_SKILLS_FAILURE = 'SEARCH_SKILLS_FAILURE';
export const ADVANCED_SEARCH_REQUEST = 'ADVANCED_SEARCH_REQUEST';
export const ADVANCED_SEARCH_SUCCESS = 'ADVANCED_SEARCH_SUCCESS';
export const ADVANCED_SEARCH_FAILURE = 'ADVANCED_SEARCH_FAILURE';
export const SET_SKILLS = 'SET_SKILLS';
export const DELETE_USER_SKILL_REQUEST = 'DELETE_USER_SKILL_REQUEST';
export const DELETE_USER_SKILL_SUCCESS = 'DELETE_USER_SKILL_SUCCESS';
export const DELETE_USER_SKILL_FAILURE = 'DELETE_USER_SKILL_FAILURE';

// Action Creators

/**
 * Fetches skills for a user
 * @param {string} userId - The ID of the user
 * @param {number} [page=1] - The page number for pagination
 * @param {string} [category] - The category of skills to fetch
 * @param {string} [search] - The search term for skills
 * @returns {Function} Thunk function
 */
export const fetchSkills = (userId, page = 1, category, search) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_SKILLS_REQUEST });
    const data = await skillService.listSkills(userId, page, category, search);
    dispatch({ type: FETCH_SKILLS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: FETCH_SKILLS_FAILURE, payload: error.message });
  }
};

/**
 * Fetches a specific skill by ID
 * @param {string} skillId - The ID of the skill to fetch
 * @returns {Function} Thunk function
 */
export const getSkill = (skillId) => async (dispatch) => {
  try {
    dispatch({ type: GET_SKILL_REQUEST });
    const data = await skillService.getSkill(skillId);
    dispatch({ type: GET_SKILL_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: GET_SKILL_FAILURE, payload: error.message });
  }
};

/**
 * Creates a new skill for a user
 * @param {string} userId - The ID of the user
 * @param {Object} skillData - The data for the new skill
 * @returns {Function} Thunk function
 */
export const createSkill = (userId, skillData) => async (dispatch) => {
  try {
    dispatch({ type: CREATE_SKILL_REQUEST });
    const data = await skillService.createSkill(userId, skillData);
    dispatch({ type: CREATE_SKILL_SUCCESS, payload: data });
    return data;
  } catch (error) {
    dispatch({ type: CREATE_SKILL_FAILURE, payload: error.message });
    throw error;
  }
};

/**
 * Updates an existing skill
 * @param {string} skillId - The ID of the skill to update
 * @param {Object} skillData - The updated data for the skill
 * @returns {Function} Thunk function
 */
export const updateSkill = (skillId, skillData) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_SKILL_REQUEST });
    const data = await skillService.updateSkill(skillId, skillData);
    dispatch({ type: UPDATE_SKILL_SUCCESS, payload: data });
    return data;
  } catch (error) {
    dispatch({ type: UPDATE_SKILL_FAILURE, payload: error.message });
    throw error;
  }
};

/**
 * Deletes a skill
 * @param {string} skillId - The ID of the skill to delete
 * @returns {Function} Thunk function
 */
export const deleteSkill = (skillId) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_SKILL_REQUEST });
    await skillService.deleteSkill(skillId);
    dispatch({ type: DELETE_SKILL_SUCCESS, payload: skillId });
  } catch (error) {
    dispatch({ type: DELETE_SKILL_FAILURE, payload: error.message });
    throw error;
  }
};

/**
 * Adds a skill to a user's profile
 * @param {Object} skillData - The data for the skill to add
 * @returns {Function} Thunk function
 */
export const addUserSkill = (skillData) => async (dispatch, getState) => {
  try {
    dispatch({ type: CREATE_SKILL_REQUEST });
    const { auth: { user } } = getState();
    const data = await skillService.addUserSkill(user.id, skillData);
    dispatch({ type: CREATE_SKILL_SUCCESS, payload: data });
    return data;
  } catch (error) {
    dispatch({ type: CREATE_SKILL_FAILURE, payload: error.message });
    throw error;
  }
};

/**
 * Fetches token information for a skill
 * @param {string} skillId - The ID of the skill
 * @returns {Function} Thunk function
 */
export const getSkillTokenInfo = (skillId) => async (dispatch) => {
  try {
    dispatch({ type: GET_SKILL_TOKEN_INFO_REQUEST });
    const data = await skillService.getSkillTokenInfo(skillId);
    dispatch({ type: GET_SKILL_TOKEN_INFO_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: GET_SKILL_TOKEN_INFO_FAILURE, payload: error.message });
  }
};

/**
 * Fetches skill trends
 * @returns {Function} Thunk function
 */
export const getSkillTrends = () => async (dispatch) => {
  try {
    dispatch({ type: GET_SKILL_TRENDS_REQUEST });
    const data = await skillService.getSkillTrends();
    dispatch({ type: GET_SKILL_TRENDS_SUCCESS, payload: data });
  } catch (error) {
    dispatch({ type: GET_SKILL_TRENDS_FAILURE, payload: error.message });
  }
};

/**
 * Fetches related skills for a given skill
 * @param {string} skillId - The ID of the skill
 * @returns {Function} Thunk function
 */
export const getRelatedSkills = (skillId) => async (dispatch) => {
  try {
    dispatch({ type: GET_RELATED_SKILLS_REQUEST });
    const data = await skillService.getRelatedSkills(skillId);
    dispatch({ type: GET_RELATED_SKILLS_SUCCESS, payload: data });
    return data;
  } catch (error) {
    dispatch({ type: GET_RELATED_SKILLS_FAILURE, payload: error.message });
    throw error;
  }
};

/**
 * Fetches skill statistics for a user
 * @param {string} userId - The ID of the user
 * @param {string} skillId - The ID of the skill
 * @returns {Function} Thunk function
 */
export const getSkillStatistics = (userId, skillId) => async (dispatch) => {
  if (!skillId) {
    console.log('No skill selected for statistics');
    return;
  }
  try {
    dispatch({ type: GET_SKILL_STATISTICS_REQUEST });
    const data = await skillService.getSkillStatistics(userId, skillId);
    if (data === null) {
      dispatch({ type: GET_SKILL_STATISTICS_FAILURE, payload: 'Skill not found or no statistics available' });
    } else {
      dispatch({ type: GET_SKILL_STATISTICS_SUCCESS, payload: data });
    }
  } catch (error) {
    dispatch({ type: GET_SKILL_STATISTICS_FAILURE, payload: error.message });
  }
};

/**
 * Helper function to handle errors
 * @param {Error} error - The error object
 * @param {Function} dispatch - The dispatch function
 * @param {string} actionType - The action type for the error
 */
const handleError = (error, dispatch, actionType) => {
  const errorMessage = error.message || 'An unknown error occurred';
  dispatch({ type: actionType, payload: errorMessage });
  throw error;
};

/**
 * Searches for skills with debounce
 * @param {string} searchTerm - The search term
 * @param {Object} [filters={}] - Additional filters for the search
 * @returns {Function} Thunk function
 */
export const searchSkills = (searchTerm, filters = {}) => async (dispatch, getState) => {
  console.log('searchSkills called with:', { searchTerm, filters });

  const trimmedSearchTerm = typeof searchTerm === 'string' ? searchTerm.trim() : '';
  console.log('Trimmed searchTerm:', trimmedSearchTerm);

  if (!trimmedSearchTerm) {
    console.log('Search term is empty, clearing results');
    dispatch({ type: CLEAR_SEARCH_RESULTS });
    return;
  }

  dispatch({ type: SEARCH_SKILLS_REQUEST });

  try {
    const state = getState();
    const userId = state.auth.user?.id;
    console.log('Searching skills for userId:', userId);

    const response = await skillService.advancedSkillSearch(userId, trimmedSearchTerm);
    console.log('Search API response:', response);

    if (
      response.perfectMatches.length === 0 &&
      response.potentialExchanges.length === 0 &&
      response.yourOfferings.length === 0
    ) {
      console.log('No results found');
      dispatch({ type: SEARCH_SKILLS_SUCCESS, payload: { perfectMatches: [], potentialExchanges: [], yourOfferings: [] } });
    } else {
      console.log('Results found, dispatching success');
      dispatch({ type: SEARCH_SKILLS_SUCCESS, payload: response });
    }
  } catch (error) {
    console.error('Error searching skills:', error);
    dispatch({ type: SEARCH_SKILLS_FAILURE, payload: error.message });
  }
};

/**
 * Clears search results
 * @returns {Object} Action object
 */
export const clearSearchResults = () => ({
  type: CLEAR_SEARCH_RESULTS
});

/**
 * Sets skills in the state
 * @param {Array} skills - The skills to set
 * @returns {Object} Action object
 */
export const setSkills = (skills) => ({
  type: SET_SKILLS,
  payload: skills
});

/**
 * Sets the selected skill
 * @param {Object} skill - The skill to set as selected
 * @returns {Object} Action object
 */
export const setSelectedSkill = (skill) => ({
  type: SET_SELECTED_SKILL,
  payload: skill
});

/**
 * Fetches skills for a user
 * @param {string} userId - The ID of the user
 * @returns {Function} Thunk function
 */
export const fetchUserSkills = (userId) => async (dispatch) => {
  try {
    dispatch({ type: FETCH_USER_SKILLS_REQUEST });
    const skills = await skillService.getUserKnownSkills(userId);
    dispatch({ type: FETCH_USER_SKILLS_SUCCESS, payload: skills });
  } catch (error) {
    dispatch({ type: FETCH_USER_SKILLS_FAILURE, payload: error.message });
  }
};

/**
 * Updates the proficiency of a user's skill
 * @param {string} userId - The ID of the user
 * @param {string} skillId - The ID of the skill
 * @param {number} proficiency - The new proficiency level
 * @returns {Function} Thunk function
 */
export const updateUserSkillProficiency = (userId, skillId, proficiency) => async (dispatch) => {
  try {
    dispatch({ type: UPDATE_SKILL_REQUEST });
    const data = await skillService.updateSkill(skillId, { userId, proficiency });
    dispatch({ type: UPDATE_SKILL_SUCCESS, payload: data });
    return data;
  } catch (error) {
    handleError(error, dispatch, UPDATE_SKILL_FAILURE);
  }
};

/**
 * Removes a skill from a user's profile
 * @param {string} userId - The ID of the user
 * @param {string} skillId - The ID of the skill to remove
 * @returns {Function} Thunk function
 */
export const removeUserSkill = (userId, skillId) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_SKILL_REQUEST });
    await skillService.deleteSkill(skillId);
    dispatch({ type: DELETE_SKILL_SUCCESS, payload: skillId });
  } catch (error) {
    handleError(error, dispatch, DELETE_SKILL_FAILURE);
  }
};

/**
 * Initiates a skill exchange between two users
 * @param {string} skill1Id - The ID of the first skill
 * @param {string} skill2Id - The ID of the second skill
 * @param {string} user1Id - The ID of the first user
 * @param {string} user2Id - The ID of the second user
 * @returns {Function} Thunk function
 */
export const initiateSkillExchange = (skill1Id, skill2Id, user1Id, user2Id) => async (dispatch) => {
  try {
    dispatch({ type: INITIATE_SKILL_EXCHANGE_REQUEST });
    const data = await skillService.initiateSkillExchange(skill1Id, skill2Id, user1Id, user2Id);
    dispatch({ type: INITIATE_SKILL_EXCHANGE_SUCCESS, payload: data });
    return data;
  } catch (error) {
    handleError(error, dispatch, INITIATE_SKILL_EXCHANGE_FAILURE);
  }
};

/**
 * Fetches trending skills
 * @returns {Function} Thunk function
 */
export const getTrendingSkills = () => async (dispatch) => {
  try {
    console.log('Fetching trending skills...');
    dispatch({ type: GET_TRENDING_SKILLS_REQUEST });
    const data = await skillService.getTrendingSkills();
    console.log('Trending skills data:', data);
    dispatch({ type: GET_TRENDING_SKILLS_SUCCESS, payload: data });
  } catch (error) {
    console.error('Error fetching trending skills:', error);
    dispatch({ type: GET_TRENDING_SKILLS_FAILURE, payload: error.message });
  }
};

/**
 * Deletes a user's skill
 * @param {string} skillId - The ID of the skill to delete
 * @returns {Function} Thunk function
 */
export const deleteUserSkill = (skillId) => async (dispatch) => {
  try {
    dispatch({ type: DELETE_USER_SKILL_REQUEST });
    await skillService.deleteUserSkill(skillId);
    dispatch({ type: DELETE_USER_SKILL_SUCCESS, payload: skillId });
  } catch (error) {
    dispatch({ type: DELETE_USER_SKILL_FAILURE, payload: error.message });
    throw error;
  }
};