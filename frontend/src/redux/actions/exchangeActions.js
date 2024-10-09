import exchangeService from '../../services/exchangeService';

// Action Types
export const FETCH_EXCHANGES_REQUEST = 'FETCH_EXCHANGES_REQUEST';
export const FETCH_EXCHANGES_SUCCESS = 'FETCH_EXCHANGES_SUCCESS';
export const FETCH_EXCHANGES_FAILURE = 'FETCH_EXCHANGES_FAILURE';
export const CREATE_EXCHANGE_REQUEST = 'CREATE_EXCHANGE_REQUEST';
export const CREATE_EXCHANGE_SUCCESS = 'CREATE_EXCHANGE_SUCCESS';
export const CREATE_EXCHANGE_FAILURE = 'CREATE_EXCHANGE_FAILURE';
export const GET_EXCHANGE_REQUEST = 'GET_EXCHANGE_REQUEST';
export const GET_EXCHANGE_SUCCESS = 'GET_EXCHANGE_SUCCESS';
export const GET_EXCHANGE_FAILURE = 'GET_EXCHANGE_FAILURE';
export const RESPOND_TO_EXCHANGE_REQUEST = 'RESPOND_TO_EXCHANGE_REQUEST';
export const RESPOND_TO_EXCHANGE_SUCCESS = 'RESPOND_TO_EXCHANGE_SUCCESS';
export const RESPOND_TO_EXCHANGE_FAILURE = 'RESPOND_TO_EXCHANGE_FAILURE';
export const CANCEL_EXCHANGE_REQUEST = 'CANCEL_EXCHANGE_REQUEST';
export const CANCEL_EXCHANGE_SUCCESS = 'CANCEL_EXCHANGE_SUCCESS';
export const CANCEL_EXCHANGE_FAILURE = 'CANCEL_EXCHANGE_FAILURE';
export const COMPLETE_EXCHANGE_REQUEST = 'COMPLETE_EXCHANGE_REQUEST';
export const COMPLETE_EXCHANGE_SUCCESS = 'COMPLETE_EXCHANGE_SUCCESS';
export const COMPLETE_EXCHANGE_FAILURE = 'COMPLETE_EXCHANGE_FAILURE';
export const CONNECT_FOR_EXCHANGE_REQUEST = 'CONNECT_FOR_EXCHANGE_REQUEST';
export const CONNECT_FOR_EXCHANGE_SUCCESS = 'CONNECT_FOR_EXCHANGE_SUCCESS';
export const CONNECT_FOR_EXCHANGE_FAILURE = 'CONNECT_FOR_EXCHANGE_FAILURE';
export const FETCH_EXCHANGE_ANALYTICS_REQUEST = 'FETCH_EXCHANGE_ANALYTICS_REQUEST';
export const FETCH_EXCHANGE_ANALYTICS_SUCCESS = 'FETCH_EXCHANGE_ANALYTICS_SUCCESS';
export const FETCH_EXCHANGE_ANALYTICS_FAILURE = 'FETCH_EXCHANGE_ANALYTICS_FAILURE';
export const SUGGEST_EXCHANGE_MATCHES_REQUEST = 'SUGGEST_EXCHANGE_MATCHES_REQUEST';
export const SUGGEST_EXCHANGE_MATCHES_SUCCESS = 'SUGGEST_EXCHANGE_MATCHES_SUCCESS';
export const SUGGEST_EXCHANGE_MATCHES_FAILURE = 'SUGGEST_EXCHANGE_MATCHES_FAILURE';
export const ADVANCED_SKILL_SEARCH_REQUEST = 'ADVANCED_SKILL_SEARCH_REQUEST';
export const ADVANCED_SKILL_SEARCH_SUCCESS = 'ADVANCED_SKILL_SEARCH_SUCCESS';
export const ADVANCED_SKILL_SEARCH_FAILURE = 'ADVANCED_SKILL_SEARCH_FAILURE';
export const ADVANCED_SEARCH_REQUEST = 'ADVANCED_SEARCH_REQUEST';
export const ADVANCED_SEARCH_SUCCESS = 'ADVANCED_SEARCH_SUCCESS';
export const ADVANCED_SEARCH_FAILURE = 'ADVANCED_SEARCH_FAILURE';
export const CREATE_SKILL_CIRCLE_REQUEST = 'CREATE_SKILL_CIRCLE_REQUEST';
export const CREATE_SKILL_CIRCLE_SUCCESS = 'CREATE_SKILL_CIRCLE_SUCCESS';
export const CREATE_SKILL_CIRCLE_FAILURE = 'CREATE_SKILL_CIRCLE_FAILURE';
export const INVITE_TO_SKILL_CIRCLE_REQUEST = 'INVITE_TO_SKILL_CIRCLE_REQUEST';
export const INVITE_TO_SKILL_CIRCLE_SUCCESS = 'INVITE_TO_SKILL_CIRCLE_SUCCESS';
export const INVITE_TO_SKILL_CIRCLE_FAILURE = 'INVITE_TO_SKILL_CIRCLE_FAILURE';
export const RESPOND_TO_SKILL_CIRCLE_INVITATION_REQUEST = 'RESPOND_TO_SKILL_CIRCLE_INVITATION_REQUEST';
export const RESPOND_TO_SKILL_CIRCLE_INVITATION_SUCCESS = 'RESPOND_TO_SKILL_CIRCLE_INVITATION_SUCCESS';
export const RESPOND_TO_SKILL_CIRCLE_INVITATION_FAILURE = 'RESPOND_TO_SKILL_CIRCLE_INVITATION_FAILURE';
export const GET_SKILL_CIRCLE_DETAILS_REQUEST = 'GET_SKILL_CIRCLE_DETAILS_REQUEST';
export const GET_SKILL_CIRCLE_DETAILS_SUCCESS = 'GET_SKILL_CIRCLE_DETAILS_SUCCESS';
export const GET_SKILL_CIRCLE_DETAILS_FAILURE = 'GET_SKILL_CIRCLE_DETAILS_FAILURE';
export const SETUP_LOCAL_CHAPTER_REQUEST = 'SETUP_LOCAL_CHAPTER_REQUEST';
export const SETUP_LOCAL_CHAPTER_SUCCESS = 'SETUP_LOCAL_CHAPTER_SUCCESS';
export const SETUP_LOCAL_CHAPTER_FAILURE = 'SETUP_LOCAL_CHAPTER_FAILURE';
export const JOIN_LOCAL_CHAPTER_REQUEST = 'JOIN_LOCAL_CHAPTER_REQUEST';
export const JOIN_LOCAL_CHAPTER_SUCCESS = 'JOIN_LOCAL_CHAPTER_SUCCESS';
export const JOIN_LOCAL_CHAPTER_FAILURE = 'JOIN_LOCAL_CHAPTER_FAILURE';
export const ORGANIZE_OFFLINE_EXCHANGE_REQUEST = 'ORGANIZE_OFFLINE_EXCHANGE_REQUEST';
export const ORGANIZE_OFFLINE_EXCHANGE_SUCCESS = 'ORGANIZE_OFFLINE_EXCHANGE_SUCCESS';
export const ORGANIZE_OFFLINE_EXCHANGE_FAILURE = 'ORGANIZE_OFFLINE_EXCHANGE_FAILURE';
export const GET_GLOBAL_SKILL_DEMAND_REQUEST = 'GET_GLOBAL_SKILL_DEMAND_REQUEST';
export const GET_GLOBAL_SKILL_DEMAND_SUCCESS = 'GET_GLOBAL_SKILL_DEMAND_SUCCESS';
export const GET_GLOBAL_SKILL_DEMAND_FAILURE = 'GET_GLOBAL_SKILL_DEMAND_FAILURE';
export const GENERATE_SKILL_QUEST_REQUEST = 'GENERATE_SKILL_QUEST_REQUEST';
export const GENERATE_SKILL_QUEST_SUCCESS = 'GENERATE_SKILL_QUEST_SUCCESS';
export const GENERATE_SKILL_QUEST_FAILURE = 'GENERATE_SKILL_QUEST_FAILURE';
export const GET_SKILL_HEAT_MAP_REQUEST = 'GET_SKILL_HEAT_MAP_REQUEST';
export const GET_SKILL_HEAT_MAP_SUCCESS = 'GET_SKILL_HEAT_MAP_SUCCESS';
export const GET_SKILL_HEAT_MAP_FAILURE = 'GET_SKILL_HEAT_MAP_FAILURE';
export const COMPLETE_SKILL_QUEST_OBJECTIVE_REQUEST = 'COMPLETE_SKILL_QUEST_OBJECTIVE_REQUEST';
export const COMPLETE_SKILL_QUEST_OBJECTIVE_SUCCESS = 'COMPLETE_SKILL_QUEST_OBJECTIVE_SUCCESS';
export const COMPLETE_SKILL_QUEST_OBJECTIVE_FAILURE = 'COMPLETE_SKILL_QUEST_OBJECTIVE_FAILURE';
export const CREATE_REVIEW_REQUEST = 'CREATE_REVIEW_REQUEST';
export const CREATE_REVIEW_SUCCESS = 'CREATE_REVIEW_SUCCESS';
export const CREATE_REVIEW_FAILURE = 'CREATE_REVIEW_FAILURE';
export const GET_REVIEWS_FOR_USER_REQUEST = 'GET_REVIEWS_FOR_USER_REQUEST';
export const GET_REVIEWS_FOR_USER_SUCCESS = 'GET_REVIEWS_FOR_USER_SUCCESS';
export const GET_REVIEWS_FOR_USER_FAILURE = 'GET_REVIEWS_FOR_USER_FAILURE';
export const GET_REVIEWS_FOR_EXCHANGE_REQUEST = 'GET_REVIEWS_FOR_EXCHANGE_REQUEST';
export const GET_REVIEWS_FOR_EXCHANGE_SUCCESS = 'GET_REVIEWS_FOR_EXCHANGE_SUCCESS';
export const GET_REVIEWS_FOR_EXCHANGE_FAILURE = 'GET_REVIEWS_FOR_EXCHANGE_FAILURE';
export const UPDATE_REVIEW_REQUEST = 'UPDATE_REVIEW_REQUEST';
export const UPDATE_REVIEW_SUCCESS = 'UPDATE_REVIEW_SUCCESS';
export const UPDATE_REVIEW_FAILURE = 'UPDATE_REVIEW_FAILURE';
export const DELETE_REVIEW_REQUEST = 'DELETE_REVIEW_REQUEST';
export const DELETE_REVIEW_SUCCESS = 'DELETE_REVIEW_SUCCESS';
export const DELETE_REVIEW_FAILURE = 'DELETE_REVIEW_FAILURE';
export const RECORD_EXCHANGE_FEEDBACK_REQUEST = 'RECORD_EXCHANGE_FEEDBACK_REQUEST';
export const RECORD_EXCHANGE_FEEDBACK_SUCCESS = 'RECORD_EXCHANGE_FEEDBACK_SUCCESS';
export const RECORD_EXCHANGE_FEEDBACK_FAILURE = 'RECORD_EXCHANGE_FEEDBACK_FAILURE';

// Action Creators

/**
 * Fetches all exchanges
 * @returns {Function} Thunk function
 */
export const fetchExchanges = () => async (dispatch) => {
  dispatch({ type: FETCH_EXCHANGES_REQUEST });
  try {
    const exchanges = await exchangeService.listExchanges();
    console.log('Fetched exchanges:', exchanges);
    dispatch({ type: FETCH_EXCHANGES_SUCCESS, payload: exchanges });
  } catch (error) {
    console.error('Error fetching exchanges:', error);
    dispatch({ 
      type: FETCH_EXCHANGES_FAILURE, 
      payload: error.response?.data?.message || error.message || 'An unknown error occurred'
    });
  }
};

/**
 * Creates a new exchange
 * @param {string} providerId - ID of the skill provider
 * @param {string} skillId - ID of the skill being exchanged
 * @param {number} duration - Duration of the exchange
 * @param {Date} proposedTime - Proposed time for the exchange
 * @returns {Function} Thunk function
 */
export const createExchange = (providerId, skillId, duration, proposedTime) => async (dispatch) => {
  dispatch({ type: CREATE_EXCHANGE_REQUEST });
  try {
    const exchange = await exchangeService.createExchangeRequest(providerId, skillId, duration, proposedTime);
    dispatch({ type: CREATE_EXCHANGE_SUCCESS, payload: exchange });
  } catch (error) {
    dispatch({ type: CREATE_EXCHANGE_FAILURE, payload: error.message });
  }
};

/**
 * Fetches a specific exchange by ID
 * @param {string} exchangeId - ID of the exchange to fetch
 * @returns {Function} Thunk function
 */
export const getExchange = (exchangeId) => async (dispatch) => {
  dispatch({ type: GET_EXCHANGE_REQUEST });
  try {
    const exchange = await exchangeService.getExchange(exchangeId);
    dispatch({ type: GET_EXCHANGE_SUCCESS, payload: exchange });
  } catch (error) {
    dispatch({ type: GET_EXCHANGE_FAILURE, payload: error.message });
  }
};

/**
 * Responds to an exchange request
 * @param {string} exchangeId - ID of the exchange to respond to
 * @param {string} action - Action to take (e.g., 'accept', 'reject')
 * @returns {Function} Thunk function
 */
export const respondToExchange = (exchangeId, action) => async (dispatch) => {
  dispatch({ type: RESPOND_TO_EXCHANGE_REQUEST });
  try {
    const exchange = await exchangeService.respondToExchangeRequest(exchangeId, action);
    dispatch({ type: RESPOND_TO_EXCHANGE_SUCCESS, payload: exchange });
  } catch (error) {
    dispatch({ type: RESPOND_TO_EXCHANGE_FAILURE, payload: error.message });
    throw error;
  }
};

/**
 * Completes an exchange
 * @param {string} exchangeId - ID of the exchange to complete
 * @param {number} rating - Rating given for the exchange
 * @param {string} feedback - Feedback for the exchange
 * @returns {Function} Thunk function
 */
export const completeExchange = (exchangeId, rating, feedback) => async (dispatch) => {
  dispatch({ type: COMPLETE_EXCHANGE_REQUEST });
  try {
    const exchange = await exchangeService.completeExchange(exchangeId, rating, feedback);
    dispatch({ type: COMPLETE_EXCHANGE_SUCCESS, payload: exchange });
  } catch (error) {
    dispatch({ type: COMPLETE_EXCHANGE_FAILURE, payload: error.message });
  }
};

/**
 * Fetches exchange analytics
 * @returns {Function} Thunk function
 */
export const fetchExchangeAnalytics = () => async (dispatch) => {
  dispatch({ type: FETCH_EXCHANGE_ANALYTICS_REQUEST });
  try {
    const analytics = await exchangeService.getExchangeAnalytics();
    dispatch({ type: FETCH_EXCHANGE_ANALYTICS_SUCCESS, payload: analytics });
  } catch (error) {
    dispatch({ type: FETCH_EXCHANGE_ANALYTICS_FAILURE, payload: error.message });
  }
};

/**
 * Initiates a connection for an exchange
 * @param {Object} exchangeRequest - Exchange request details
 * @returns {Function} Thunk function
 */
export const connectForExchange = (exchangeRequest) => async (dispatch) => {
  dispatch({ type: CONNECT_FOR_EXCHANGE_REQUEST });
  try {
    const exchange = await exchangeService.connectForExchange(exchangeRequest);
    dispatch({ type: CONNECT_FOR_EXCHANGE_SUCCESS, payload: exchange });
    dispatch(fetchExchanges());
    return exchange;
  } catch (error) {
    dispatch({ type: CONNECT_FOR_EXCHANGE_FAILURE, payload: error.message });
    throw error;
  }
};

/**
 * Performs an advanced skill search
 * @param {string} searchTerm - Search term for skills
 * @param {Object} filters - Filters to apply to the search
 * @returns {Function} Thunk function
 */
export const performAdvancedSkillSearch = (searchTerm, filters) => async (dispatch, getState) => {
  dispatch({ type: ADVANCED_SEARCH_REQUEST });
  try {
    const state = getState();
    const userId = state.auth.user?.id;

    const response = await exchangeService.advancedSkillSearch(userId, searchTerm, filters);

    const formattedResults = {
      perfectMatches: response.perfectMatches || [],
      potentialExchanges: response.potentialExchanges || [],
      yourOfferings: response.yourOfferings || [],
      matchedSkills: response.matchedSkills || []
    };

    dispatch({ type: ADVANCED_SEARCH_SUCCESS, payload: formattedResults });
  } catch (error) {
    console.error('Error performing advanced search:', error);
    dispatch({ type: ADVANCED_SEARCH_FAILURE, payload: error.message });
  }
};

/**
 * Cancels an exchange
 * @param {string} exchangeId - ID of the exchange to cancel
 * @returns {Function} Thunk function
 */
export const cancelExchange = (exchangeId) => async (dispatch) => {
  dispatch({ type: CANCEL_EXCHANGE_REQUEST });
  try {
    await exchangeService.cancelExchange(exchangeId);
    dispatch({ type: CANCEL_EXCHANGE_SUCCESS, payload: exchangeId });
  } catch (error) {
    dispatch({ 
      type: CANCEL_EXCHANGE_FAILURE, 
      payload: error.response?.data?.message || 'Failed to cancel exchange'
    });
  }
};

/**
 * Creates a review for an exchange
 * @param {string} exchangeId - ID of the exchange to review
 * @param {number} rating - Rating given for the exchange
 * @param {string} comment - Review comment
 * @returns {Function} Thunk function
 */
export const createReview = (exchangeId, rating, comment) => async (dispatch) => {
  dispatch({ type: CREATE_REVIEW_REQUEST });
  try {
    const review = await exchangeService.createReview(exchangeId, rating, comment);
    dispatch({ type: CREATE_REVIEW_SUCCESS, payload: review });
  } catch (error) {
    dispatch({ type: CREATE_REVIEW_FAILURE, payload: error.message });
  }
};

/**
 * Fetches reviews for a specific user
 * @param {string} userId - ID of the user to fetch reviews for
 * @returns {Function} Thunk function
 */
export const getReviewsForUser = (userId) => async (dispatch) => {
  dispatch({ type: GET_REVIEWS_FOR_USER_REQUEST });
  try {
    const reviews = await exchangeService.getReviewsForUser(userId);
    dispatch({ type: GET_REVIEWS_FOR_USER_SUCCESS, payload: reviews });
  } catch (error) {
    dispatch({ type: GET_REVIEWS_FOR_USER_FAILURE, payload: error.message });
  }
};

/**
 * Fetches reviews for a specific exchange
 * @param {string} exchangeId - ID of the exchange to fetch reviews for
 * @returns {Function} Thunk function
 */
export const getReviewsForExchange = (exchangeId) => async (dispatch) => {
  dispatch({ type: GET_REVIEWS_FOR_EXCHANGE_REQUEST });
  try {
    const reviews = await exchangeService.getReviewsForExchange(exchangeId);
    dispatch({ type: GET_REVIEWS_FOR_EXCHANGE_SUCCESS, payload: reviews });
  } catch (error) {
    dispatch({ type: GET_REVIEWS_FOR_EXCHANGE_FAILURE, payload: error.message });
  }
};

/**
 * Updates an existing review
 * @param {string} reviewId - ID of the review to update
 * @param {number} rating - Updated rating
 * @param {string} comment - Updated comment
 * @returns {Function} Thunk function
 */
export const updateReview = (reviewId, rating, comment) => async (dispatch) => {
  dispatch({ type: UPDATE_REVIEW_REQUEST });
  try {
    const updatedReview = await exchangeService.updateReview(reviewId, rating, comment);
    dispatch({ type: UPDATE_REVIEW_SUCCESS, payload: updatedReview });
  } catch (error) {
    dispatch({ type: UPDATE_REVIEW_FAILURE, payload: error.message });
  }
};

/**
 * Deletes a review
 * @param {string} reviewId - ID of the review to delete
 * @returns {Function} Thunk function
 */
export const deleteReview = (reviewId) => async (dispatch) => {
  dispatch({ type: DELETE_REVIEW_REQUEST });
  try {
    await exchangeService.deleteReview(reviewId);
    dispatch({ type: DELETE_REVIEW_SUCCESS, payload: reviewId });
  } catch (error) {
    dispatch({ type: DELETE_REVIEW_FAILURE, payload: error.message });
  }
};

/**
 * Creates a new skill circle
 * @param {Object} circleData - Data for creating the skill circle
 * @returns {Function} Thunk function
 */
export const createSkillCircle = (circleData) => async (dispatch) => {
  dispatch({ type: CREATE_SKILL_CIRCLE_REQUEST });
  try {
    const circle = await exchangeService.createSkillCircle(circleData);
    dispatch({ type: CREATE_SKILL_CIRCLE_SUCCESS, payload: circle });
  } catch (error) {
    dispatch({ type: CREATE_SKILL_CIRCLE_FAILURE, payload: error.message });
  }
};

/**
 * Invites a user to a skill circle
 * @param {string} circleId - ID of the skill circle
 * @param {string} userId - ID of the user to invite
 * @returns {Function} Thunk function
 */
export const inviteToSkillCircle = (circleId, userId) => async (dispatch) => {
  dispatch({ type: INVITE_TO_SKILL_CIRCLE_REQUEST });
  try {
    const result = await exchangeService.inviteToSkillCircle(circleId, userId);
    dispatch({ type: INVITE_TO_SKILL_CIRCLE_SUCCESS, payload: result });
  } catch (error) {
    dispatch({ type: INVITE_TO_SKILL_CIRCLE_FAILURE, payload: error.message });
  }
};

/**
 * Responds to a skill circle invitation
 * @param {string} invitationId - ID of the invitation
 * @param {string} response - Response to the invitation ('accept' or 'decline')
 * @returns {Function} Thunk function
 */
export const respondToSkillCircleInvitation = (invitationId, response) => async (dispatch) => {
  dispatch({ type: RESPOND_TO_SKILL_CIRCLE_INVITATION_REQUEST });
  try {
    const result = await exchangeService.respondToSkillCircleInvitation(invitationId, response);
    dispatch({ type: RESPOND_TO_SKILL_CIRCLE_INVITATION_SUCCESS, payload: result });
  } catch (error) {
    dispatch({ type: RESPOND_TO_SKILL_CIRCLE_INVITATION_FAILURE, payload: error.message });
  }
};

/**
 * Fetches details of a skill circle
 * @param {string} circleId - ID of the skill circle
 * @returns {Function} Thunk function
 */
export const getSkillCircleDetails = (circleId) => async (dispatch) => {
  dispatch({ type: GET_SKILL_CIRCLE_DETAILS_REQUEST });
  try {
    const details = await exchangeService.getSkillCircleDetails(circleId);
    dispatch({ type: GET_SKILL_CIRCLE_DETAILS_SUCCESS, payload: details });
  } catch (error) {
    dispatch({ type: GET_SKILL_CIRCLE_DETAILS_FAILURE, payload: error.message });
  }
};

/**
 * Sets up a local chapter
 * @param {Object} chapterData - Data for setting up the local chapter
 * @returns {Function} Thunk function
 */
export const setupLocalChapter = (chapterData) => async (dispatch) => {
  dispatch({ type: SETUP_LOCAL_CHAPTER_REQUEST });
  try {
    const chapter = await exchangeService.setupLocalChapter(chapterData);
    dispatch({ type: SETUP_LOCAL_CHAPTER_SUCCESS, payload: chapter });
  } catch (error) {
    dispatch({ type: SETUP_LOCAL_CHAPTER_FAILURE, payload: error.message });
  }
};

/**
 * Joins a local chapter
 * @param {string} chapterId - ID of the local chapter to join
 * @returns {Function} Thunk function
 */
export const joinLocalChapter = (chapterId) => async (dispatch) => {
  dispatch({ type: JOIN_LOCAL_CHAPTER_REQUEST });
  try {
    const result = await exchangeService.joinLocalChapter(chapterId);
    dispatch({ type: JOIN_LOCAL_CHAPTER_SUCCESS, payload: result });
  } catch (error) {
    dispatch({ type: JOIN_LOCAL_CHAPTER_FAILURE, payload: error.message });
  }
};

/**
 * Organizes an offline exchange event
 * @param {Object} eventData - Data for organizing the offline exchange event
 * @returns {Function} Thunk function
 */
export const organizeOfflineExchange = (eventData) => async (dispatch) => {
  dispatch({ type: ORGANIZE_OFFLINE_EXCHANGE_REQUEST });
  try {
    const event = await exchangeService.organizeOfflineExchange(eventData);
    dispatch({ type: ORGANIZE_OFFLINE_EXCHANGE_SUCCESS, payload: event });
  } catch (error) {
    dispatch({ type: ORGANIZE_OFFLINE_EXCHANGE_FAILURE, payload: error.message });
  }
};

/**
 * Fetches global skill demand data
 * @returns {Function} Thunk function
 */
export const getGlobalSkillDemand = () => async (dispatch) => {
  dispatch({ type: GET_GLOBAL_SKILL_DEMAND_REQUEST });
  try {
    const demandData = await exchangeService.getGlobalSkillDemand();
    dispatch({ type: GET_GLOBAL_SKILL_DEMAND_SUCCESS, payload: demandData });
  } catch (error) {
    dispatch({ type: GET_GLOBAL_SKILL_DEMAND_FAILURE, payload: error.message });
  }
};

/**
 * Generates a skill quest
 * @param {string} skillId - ID of the skill for which to generate a quest
 * @returns {Function} Thunk function
 */
export const generateSkillQuest = (skillId) => async (dispatch) => {
  dispatch({ type: GENERATE_SKILL_QUEST_REQUEST });
  try {
    const quest = await exchangeService.generateSkillQuest(skillId);
    dispatch({ type: GENERATE_SKILL_QUEST_SUCCESS, payload: quest });
  } catch (error) {
    dispatch({ type: GENERATE_SKILL_QUEST_FAILURE, payload: error.message });
  }
};

/**
 * Fetches the skill heat map data
 * @returns {Function} Thunk function
 */
export const getSkillHeatMap = () => async (dispatch) => {
  dispatch({ type: GET_SKILL_HEAT_MAP_REQUEST });
  try {
    const heatMapData = await exchangeService.getSkillHeatMap();
    dispatch({ type: GET_SKILL_HEAT_MAP_SUCCESS, payload: heatMapData });
  } catch (error) {
    dispatch({ type: GET_SKILL_HEAT_MAP_FAILURE, payload: error.message });
  }
};

/**
 * Completes a skill quest objective
 * @param {string} questId - ID of the skill quest
 * @param {string} objectiveId - ID of the objective completed
 * @returns {Function} Thunk function
 */
export const completeSkillQuestObjective = (questId, objectiveId) => async (dispatch) => {
  dispatch({ type: COMPLETE_SKILL_QUEST_OBJECTIVE_REQUEST });
  try {
    const result = await exchangeService.completeSkillQuestObjective(questId, objectiveId);
    dispatch({ type: COMPLETE_SKILL_QUEST_OBJECTIVE_SUCCESS, payload: result });
  } catch (error) {
    dispatch({ type: COMPLETE_SKILL_QUEST_OBJECTIVE_FAILURE, payload: error.message });
  }
};

/**
 * Records feedback for an exchange
 * @param {string} exchangeId - ID of the exchange
 * @param {Object} feedbackData - Feedback data for the exchange
 * @returns {Function} Thunk function
 */
export const recordExchangeFeedback = (exchangeId, feedbackData) => async (dispatch) => {
  dispatch({ type: RECORD_EXCHANGE_FEEDBACK_REQUEST });
  try {
    const result = await exchangeService.recordExchangeFeedback(exchangeId, feedbackData);
    dispatch({ type: RECORD_EXCHANGE_FEEDBACK_SUCCESS, payload: result });
  } catch (error) {
    dispatch({ type: RECORD_EXCHANGE_FEEDBACK_FAILURE, payload: error.message });
  }
};