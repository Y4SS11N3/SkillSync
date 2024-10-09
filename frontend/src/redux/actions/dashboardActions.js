import {
    fetchDashboardData,
    fetchUserSkills,
    fetchExchangeHistory,
    fetchUserReputation,
    fetchSkillMatches,
    fetchUpcomingExchanges,
    fetchGlobalSkillDemand,
    fetchPersonalizedRecommendations,
    fetchAchievements,
    fetchLearningGoals,
    createReview as createReviewService,
    fetchUserReviews as fetchUserReviewsService,
    addToLearningGoals as addToLearningGoalsService
  } from '../../services/dashboardService';
  
  // Action Types
  export const FETCH_DASHBOARD_DATA_SUCCESS = 'FETCH_DASHBOARD_DATA_SUCCESS';
  export const FETCH_DASHBOARD_DATA_FAIL = 'FETCH_DASHBOARD_DATA_FAIL';
  export const FETCH_USER_SKILLS_SUCCESS = 'FETCH_USER_SKILLS_SUCCESS';
  export const FETCH_USER_SKILLS_FAIL = 'FETCH_USER_SKILLS_FAIL';
  export const FETCH_EXCHANGE_HISTORY_SUCCESS = 'FETCH_EXCHANGE_HISTORY_SUCCESS';
  export const FETCH_EXCHANGE_HISTORY_FAIL = 'FETCH_EXCHANGE_HISTORY_FAIL';
  export const FETCH_USER_REPUTATION_SUCCESS = 'FETCH_USER_REPUTATION_SUCCESS';
  export const FETCH_USER_REPUTATION_FAIL = 'FETCH_USER_REPUTATION_FAIL';
  export const FETCH_SKILL_MATCHES_SUCCESS = 'FETCH_SKILL_MATCHES_SUCCESS';
  export const FETCH_SKILL_MATCHES_FAIL = 'FETCH_SKILL_MATCHES_FAIL';
  export const FETCH_UPCOMING_EXCHANGES_SUCCESS = 'FETCH_UPCOMING_EXCHANGES_SUCCESS';
  export const FETCH_UPCOMING_EXCHANGES_FAIL = 'FETCH_UPCOMING_EXCHANGES_FAIL';
  export const GET_GLOBAL_SKILL_DEMAND_REQUEST = 'GET_GLOBAL_SKILL_DEMAND_REQUEST';
  export const GET_GLOBAL_SKILL_DEMAND_SUCCESS = 'GET_GLOBAL_SKILL_DEMAND_SUCCESS';
  export const GET_GLOBAL_SKILL_DEMAND_FAILURE = 'GET_GLOBAL_SKILL_DEMAND_FAILURE';
  export const GET_PERSONALIZED_RECOMMENDATIONS_REQUEST = 'GET_PERSONALIZED_RECOMMENDATIONS_REQUEST';
  export const GET_PERSONALIZED_RECOMMENDATIONS_SUCCESS = 'GET_PERSONALIZED_RECOMMENDATIONS_SUCCESS';
  export const GET_PERSONALIZED_RECOMMENDATIONS_FAILURE = 'GET_PERSONALIZED_RECOMMENDATIONS_FAILURE';
  export const GET_ACHIEVEMENTS_REQUEST = 'GET_ACHIEVEMENTS_REQUEST';
  export const GET_ACHIEVEMENTS_SUCCESS = 'GET_ACHIEVEMENTS_SUCCESS';
  export const GET_ACHIEVEMENTS_FAILURE = 'GET_ACHIEVEMENTS_FAILURE';
  export const GET_LEARNING_GOALS_REQUEST = 'GET_LEARNING_GOALS_REQUEST';
  export const GET_LEARNING_GOALS_SUCCESS = 'GET_LEARNING_GOALS_SUCCESS';
  export const GET_LEARNING_GOALS_FAILURE = 'GET_LEARNING_GOALS_FAILURE';
  export const CREATE_REVIEW_SUCCESS = 'CREATE_REVIEW_SUCCESS';
  export const CREATE_REVIEW_FAILURE = 'CREATE_REVIEW_FAILURE';
  export const FETCH_USER_REVIEWS_SUCCESS = 'FETCH_USER_REVIEWS_SUCCESS';
  export const FETCH_USER_REVIEWS_FAILURE = 'FETCH_USER_REVIEWS_FAILURE';
  export const ADD_TO_LEARNING_GOALS_SUCCESS = 'ADD_TO_LEARNING_GOALS_SUCCESS';
  export const ADD_TO_LEARNING_GOALS_FAILURE = 'ADD_TO_LEARNING_GOALS_FAILURE';
  export const SET_LOADING = 'SET_LOADING';
  
  /**
   * Action creator to set loading state for a specific key
   * @param {string} key - The key to set loading state for
   * @param {boolean} isLoading - The loading state
   * @returns {Object} Action object
   */
  export const setLoading = (key, isLoading) => ({
    type: SET_LOADING,
    payload: { key, isLoading }
  });
  
  /**
   * Thunk to fetch dashboard data
   * @returns {Function} Thunk function
   */
  export const getDashboardData = () => async (dispatch) => {
    dispatch(setLoading('dashboardData', true));
    try {
      const data = await fetchDashboardData();
      dispatch({
        type: FETCH_DASHBOARD_DATA_SUCCESS,
        payload: data
      });
      if (data.reviews) {
        dispatch({
          type: FETCH_USER_REVIEWS_SUCCESS,
          payload: data.reviews
        });
      }
    } catch (error) {
      dispatch({
        type: FETCH_DASHBOARD_DATA_FAIL,
        payload: error.response?.data?.message || 'Failed to fetch dashboard data'
      });
    } finally {
      dispatch(setLoading('dashboardData', false));
    }
  };
  
  /**
   * Thunk to fetch user skills
   * @returns {Function} Thunk function
   */
  export const getUserSkills = () => async (dispatch) => {
    dispatch(setLoading('userSkills', true));
    try {
      const skills = await fetchUserSkills();
      dispatch({
        type: FETCH_USER_SKILLS_SUCCESS,
        payload: skills
      });
    } catch (error) {
      dispatch({
        type: FETCH_USER_SKILLS_FAIL,
        payload: error.response?.data?.message || 'Failed to fetch user skills'
      });
    } finally {
      dispatch(setLoading('userSkills', false));
    }
  };
  
  /**
   * Thunk to fetch exchange history
   * @returns {Function} Thunk function
   */
  export const getExchangeHistory = () => async (dispatch) => {
    dispatch(setLoading('exchangeHistory', true));
    try {
      const history = await fetchExchangeHistory();
      dispatch({
        type: FETCH_EXCHANGE_HISTORY_SUCCESS,
        payload: history
      });
    } catch (error) {
      dispatch({
        type: FETCH_EXCHANGE_HISTORY_FAIL,
        payload: error.response?.data?.message || 'Failed to fetch exchange history'
      });
    } finally {
      dispatch(setLoading('exchangeHistory', false));
    }
  };
  
  /**
   * Thunk to fetch user reputation
   * @returns {Function} Thunk function
   */
  export const getUserReputation = () => async (dispatch) => {
    dispatch(setLoading('userReputation', true));
    try {
      const data = await fetchUserReputation();
      dispatch({
        type: FETCH_USER_REPUTATION_SUCCESS,
        payload: data
      });
      if (data.reviews) {
        dispatch({
          type: FETCH_USER_REVIEWS_SUCCESS,
          payload: data.reviews
        });
      }
    } catch (error) {
      dispatch({
        type: FETCH_USER_REPUTATION_FAIL,
        payload: error.response?.data?.message || 'Failed to fetch user reputation'
      });
    } finally {
      dispatch(setLoading('userReputation', false));
    }
  };
  
  /**
   * Thunk to fetch skill matches
   * @returns {Function} Thunk function
   */
  export const getSkillMatches = () => async (dispatch) => {
    dispatch(setLoading('skillMatches', true));
    try {
      const matches = await fetchSkillMatches();
      dispatch({
        type: FETCH_SKILL_MATCHES_SUCCESS,
        payload: matches
      });
    } catch (error) {
      dispatch({
        type: FETCH_SKILL_MATCHES_FAIL,
        payload: error.response?.data?.message || 'Failed to fetch skill matches'
      });
    } finally {
      dispatch(setLoading('skillMatches', false));
    }
  };
  
  /**
   * Thunk to fetch upcoming exchanges
   * @returns {Function} Thunk function
   */
  export const getUpcomingExchanges = () => async (dispatch) => {
    dispatch(setLoading('upcomingExchanges', true));
    try {
      const exchanges = await fetchUpcomingExchanges();
      dispatch({
        type: FETCH_UPCOMING_EXCHANGES_SUCCESS,
        payload: exchanges
      });
    } catch (error) {
      dispatch({
        type: FETCH_UPCOMING_EXCHANGES_FAIL,
        payload: error.response?.data?.message || 'Failed to fetch upcoming exchanges'
      });
    } finally {
      dispatch(setLoading('upcomingExchanges', false));
    }
  };
  
  /**
   * Thunk to fetch personalized recommendations
   * @returns {Function} Thunk function
   */
  export const getPersonalizedRecommendations = () => async (dispatch) => {
    dispatch(setLoading('personalizedRecommendations', true));
    try {
      const data = await fetchPersonalizedRecommendations();
      dispatch({
        type: GET_PERSONALIZED_RECOMMENDATIONS_SUCCESS,
        payload: data
      });
    } catch (error) {
      dispatch({
        type: GET_PERSONALIZED_RECOMMENDATIONS_FAILURE,
        payload: error.response?.data?.message || 'Failed to fetch personalized recommendations'
      });
    } finally {
      dispatch(setLoading('personalizedRecommendations', false));
    }
  };
  
  /**
   * Thunk to fetch achievements
   * @returns {Function} Thunk function
   */
  export const getAchievements = () => async (dispatch) => {
    dispatch(setLoading('achievements', true));
    try {
      const data = await fetchAchievements();
      dispatch({
        type: GET_ACHIEVEMENTS_SUCCESS,
        payload: data
      });
    } catch (error) {
      dispatch({
        type: GET_ACHIEVEMENTS_FAILURE,
        payload: error.response?.data?.message || 'Failed to fetch achievements'
      });
    } finally {
      dispatch(setLoading('achievements', false));
    }
  };
  
  /**
   * Thunk to fetch learning goals
   * @returns {Function} Thunk function
   */
  export const getLearningGoals = () => async (dispatch) => {
    dispatch(setLoading('learningGoals', true));
    try {
      const data = await fetchLearningGoals();
      dispatch({
        type: GET_LEARNING_GOALS_SUCCESS,
        payload: data
      });
    } catch (error) {
      dispatch({
        type: GET_LEARNING_GOALS_FAILURE,
        payload: error.response?.data?.message || 'Failed to fetch learning goals'
      });
    } finally {
      dispatch(setLoading('learningGoals', false));
    }
  };
  
  /**
   * Thunk to add a skill to learning goals
   * @param {string} skillId - The ID of the skill to add
   * @returns {Function} Thunk function
   */
  export const addToLearningGoals = (skillId) => async (dispatch) => {
    try {
      const newGoal = await addToLearningGoalsService(skillId);
      dispatch({
        type: ADD_TO_LEARNING_GOALS_SUCCESS,
        payload: newGoal
      });
    } catch (error) {
      dispatch({
        type: ADD_TO_LEARNING_GOALS_FAILURE,
        payload: error.response?.data?.message || 'Failed to add skill to learning goals'
      });
    }
  };
  
  /**
   * Thunk to create a review
   * @param {Object} reviewData - The review data to be created
   * @returns {Function} Thunk function
   */
  export const createReviewAction = (reviewData) => async (dispatch) => {
    try {
      const response = await createReviewService(reviewData);
      dispatch({
        type: CREATE_REVIEW_SUCCESS,
        payload: response
      });
    } catch (error) {
      dispatch({
        type: CREATE_REVIEW_FAILURE,
        payload: error.response?.data?.message || 'Failed to create review'
      });
    }
  };
  
  /**
   * Thunk to fetch user reviews
   * @param {string} userId - The ID of the user whose reviews to fetch
   * @returns {Function} Thunk function
   */
  export const fetchUserReviewsAction = (userId) => async (dispatch) => {
    try {
      const response = await fetchUserReviewsService(userId);
      dispatch({
        type: FETCH_USER_REVIEWS_SUCCESS,
        payload: response
      });
    } catch (error) {
      dispatch({
        type: FETCH_USER_REVIEWS_FAILURE,
        payload: error.response?.data?.message || 'Failed to fetch user reviews'
      });
    }
  };