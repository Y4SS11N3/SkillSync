import {
    FETCH_DASHBOARD_DATA_SUCCESS,
    FETCH_DASHBOARD_DATA_FAIL,
    FETCH_USER_SKILLS_SUCCESS,
    FETCH_USER_SKILLS_FAIL,
    FETCH_EXCHANGE_HISTORY_SUCCESS,
    FETCH_EXCHANGE_HISTORY_FAIL,
    FETCH_USER_REPUTATION_SUCCESS,
    FETCH_USER_REPUTATION_FAIL,
    FETCH_SKILL_MATCHES_SUCCESS,
    FETCH_SKILL_MATCHES_FAIL,
    FETCH_UPCOMING_EXCHANGES_SUCCESS,
    FETCH_UPCOMING_EXCHANGES_FAIL,
    GET_GLOBAL_SKILL_DEMAND_SUCCESS,
    GET_GLOBAL_SKILL_DEMAND_FAILURE,
    GET_PERSONALIZED_RECOMMENDATIONS_SUCCESS,
    GET_PERSONALIZED_RECOMMENDATIONS_FAILURE,
    GET_ACHIEVEMENTS_SUCCESS,
    GET_ACHIEVEMENTS_FAILURE,
    GET_LEARNING_GOALS_SUCCESS,
    GET_LEARNING_GOALS_FAILURE,
    CREATE_REVIEW_SUCCESS,
    CREATE_REVIEW_FAILURE,
    FETCH_USER_REVIEWS_SUCCESS,
    FETCH_USER_REVIEWS_FAILURE,
    ADD_TO_LEARNING_GOALS_SUCCESS,
    ADD_TO_LEARNING_GOALS_FAILURE,
    SET_LOADING
  } from '../actions/dashboardActions';
  
  const initialState = {
    dashboardData: {
      totalConnections: 0,
      hoursExchanged: 0,
      skillsLearned: 0,
      timeCredits: 0,
      previousTotalConnections: 0,
      previousHoursExchanged: 0,
      previousSkillsLearned: 0,
      previousTimeCredits: 0
    },
    userSkills: [],
    exchangeHistory: [],
    userReputation: { score: 0, totalReviews: 0, ranking: 0, breakdown: {} },
    skillMatches: [],
    upcomingExchanges: [],
    globalSkillDemand: [],
    personalizedRecommendations: [],
    achievements: [],
    learningGoals: [],
    loading: {
      dashboardData: false,
      userSkills: false,
      exchangeHistory: false,
      userReputation: false,
      skillMatches: false,
      upcomingExchanges: false,
      globalSkillDemand: false,
      personalizedRecommendations: false,
      achievements: false,
      learningGoals: false
    },
    error: {
      dashboardData: null,
      userSkills: null,
      exchangeHistory: null,
      userReputation: null,
      skillMatches: null,
      upcomingExchanges: null,
      globalSkillDemand: null,
      personalizedRecommendations: null,
      achievements: null,
      learningGoals: null
    }
  };
  
  const dashboardReducer = (state = initialState, action) => {
    const { type, payload } = action;
  
    switch (type) {
      case SET_LOADING:
        return {
          ...state,
          loading: {
            ...state.loading,
            [payload.key]: payload.isLoading
          }
        };
      case FETCH_DASHBOARD_DATA_SUCCESS:
        console.log('Dashboard data payload:', payload);
        return {
          ...state,
          dashboardData: payload,
          error: { ...state.error, dashboardData: null }
        };
      case FETCH_DASHBOARD_DATA_FAIL:
        return {
          ...state,
          error: { ...state.error, dashboardData: payload }
        };
      case FETCH_USER_SKILLS_SUCCESS:
        console.log('User skills payload:', payload);
        return {
          ...state,
          userSkills: payload,
          error: { ...state.error, userSkills: null }
        };
      case FETCH_USER_SKILLS_FAIL:
        return {
          ...state,
          error: { ...state.error, userSkills: payload }
        };
        case FETCH_EXCHANGE_HISTORY_SUCCESS:
          return {
            ...state,
            exchangeHistory: action.payload,
            error: { ...state.error, exchangeHistory: null }
          };
        case FETCH_EXCHANGE_HISTORY_FAIL:
          return {
            ...state,
            error: { ...state.error, exchangeHistory: action.payload }
          };
      case FETCH_USER_REPUTATION_SUCCESS:
        console.log('User reputation payload:', payload);
        return {
          ...state,
          userReputation: payload,
          error: { ...state.error, userReputation: null }
        };
      case FETCH_USER_REPUTATION_FAIL:
        return {
          ...state,
          error: { ...state.error, userReputation: payload }
        };
      case FETCH_SKILL_MATCHES_SUCCESS:
        console.log('Skill matches payload:', payload);
        return {
          ...state,
          skillMatches: payload,
          error: { ...state.error, skillMatches: null }
        };
      case FETCH_SKILL_MATCHES_FAIL:
        return {
          ...state,
          error: { ...state.error, skillMatches: payload }
        };
      case FETCH_UPCOMING_EXCHANGES_SUCCESS:
        console.log('Upcoming exchanges payload:', payload);
        return {
          ...state,
          upcomingExchanges: payload,
          error: { ...state.error, upcomingExchanges: null }
        };
      case FETCH_UPCOMING_EXCHANGES_FAIL:
        return {
          ...state,
          error: { ...state.error, upcomingExchanges: payload }
        };
      case GET_GLOBAL_SKILL_DEMAND_SUCCESS:
        console.log('Global skill demand payload:', payload);
        return {
          ...state,
          globalSkillDemand: payload,
          error: { ...state.error, globalSkillDemand: null }
        };
      case GET_GLOBAL_SKILL_DEMAND_FAILURE:
        return {
          ...state,
          error: { ...state.error, globalSkillDemand: payload }
        };
      case GET_PERSONALIZED_RECOMMENDATIONS_SUCCESS:
        console.log('Personalized recommendations payload:', payload);
        return {
          ...state,
          personalizedRecommendations: payload,
          error: { ...state.error, personalizedRecommendations: null }
        };
      case GET_PERSONALIZED_RECOMMENDATIONS_FAILURE:
        return {
          ...state,
          error: { ...state.error, personalizedRecommendations: payload }
        };
      case GET_ACHIEVEMENTS_SUCCESS:
        console.log('Achievements payload:', payload);
        return {
          ...state,
          achievements: payload,
          error: { ...state.error, achievements: null }
        };
      case GET_ACHIEVEMENTS_FAILURE:
        return {
          ...state,
          error: { ...state.error, achievements: payload }
        };
      case GET_LEARNING_GOALS_SUCCESS:
        console.log('Learning goals payload:', payload);
        return {
          ...state,
          learningGoals: payload,
          error: { ...state.error, learningGoals: null }
        };
      case GET_LEARNING_GOALS_FAILURE:
        return {
          ...state,
          error: { ...state.error, learningGoals: payload }
        };
        case CREATE_REVIEW_SUCCESS:
      return {
        ...state,
        userReviews: [...state.userReviews, payload]
      };
      case FETCH_USER_REVIEWS_SUCCESS:
        return {
          ...state,
          userReviews: payload,
          error: { ...state.error, reviews: null }
        };
      case CREATE_REVIEW_FAILURE:
      case FETCH_USER_REVIEWS_FAILURE:
        return {
          ...state,
          error: { ...state.error, reviews: payload }
        };
        case ADD_TO_LEARNING_GOALS_SUCCESS:
          return {
            ...state,
            learningGoals: [...state.learningGoals, action.payload],
            error: { ...state.error, learningGoals: null }
          };
        case ADD_TO_LEARNING_GOALS_FAILURE:
          return {
            ...state,
            error: { ...state.error, learningGoals: action.payload }
          };
      default:
        return state;
    }
  };
  
  export default dashboardReducer;