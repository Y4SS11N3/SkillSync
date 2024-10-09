import {
    FETCH_EXCHANGES_REQUEST,
    FETCH_EXCHANGES_SUCCESS,
    FETCH_EXCHANGES_FAILURE,
    CREATE_EXCHANGE_REQUEST,
    CREATE_EXCHANGE_SUCCESS,
    CREATE_EXCHANGE_FAILURE,
    GET_EXCHANGE_REQUEST,
    GET_EXCHANGE_SUCCESS,
    GET_EXCHANGE_FAILURE,
    RESPOND_TO_EXCHANGE_REQUEST,
    RESPOND_TO_EXCHANGE_SUCCESS,
    RESPOND_TO_EXCHANGE_FAILURE,
    COMPLETE_EXCHANGE_REQUEST,
    COMPLETE_EXCHANGE_SUCCESS,
    COMPLETE_EXCHANGE_FAILURE,
    FETCH_EXCHANGE_ANALYTICS_REQUEST,
    FETCH_EXCHANGE_ANALYTICS_SUCCESS,
    FETCH_EXCHANGE_ANALYTICS_FAILURE,
    SUGGEST_EXCHANGE_MATCHES_REQUEST,
    SUGGEST_EXCHANGE_MATCHES_SUCCESS,
    SUGGEST_EXCHANGE_MATCHES_FAILURE,
    CREATE_SKILL_CIRCLE_REQUEST,
    CREATE_SKILL_CIRCLE_SUCCESS,
    CREATE_SKILL_CIRCLE_FAILURE,
    GET_GLOBAL_SKILL_DEMAND_REQUEST,
    GET_GLOBAL_SKILL_DEMAND_SUCCESS,
    GET_GLOBAL_SKILL_DEMAND_FAILURE,
    GENERATE_SKILL_QUEST_REQUEST,
    GENERATE_SKILL_QUEST_SUCCESS,
    GENERATE_SKILL_QUEST_FAILURE,
    GET_SKILL_HEAT_MAP_REQUEST,
    GET_SKILL_HEAT_MAP_SUCCESS,
    GET_SKILL_HEAT_MAP_FAILURE,
    INVITE_TO_SKILL_CIRCLE_REQUEST,
    INVITE_TO_SKILL_CIRCLE_SUCCESS,
    INVITE_TO_SKILL_CIRCLE_FAILURE,
    RESPOND_TO_SKILL_CIRCLE_INVITATION_REQUEST,
    RESPOND_TO_SKILL_CIRCLE_INVITATION_SUCCESS,
    RESPOND_TO_SKILL_CIRCLE_INVITATION_FAILURE,
    GET_SKILL_CIRCLE_DETAILS_REQUEST,
    GET_SKILL_CIRCLE_DETAILS_SUCCESS,
    GET_SKILL_CIRCLE_DETAILS_FAILURE,
    SETUP_LOCAL_CHAPTER_REQUEST,
    SETUP_LOCAL_CHAPTER_SUCCESS,
    SETUP_LOCAL_CHAPTER_FAILURE,
    JOIN_LOCAL_CHAPTER_REQUEST,
    JOIN_LOCAL_CHAPTER_SUCCESS,
    JOIN_LOCAL_CHAPTER_FAILURE,
    ORGANIZE_OFFLINE_EXCHANGE_REQUEST,
    ORGANIZE_OFFLINE_EXCHANGE_SUCCESS,
    ORGANIZE_OFFLINE_EXCHANGE_FAILURE,
    RECORD_EXCHANGE_FEEDBACK_REQUEST,
    RECORD_EXCHANGE_FEEDBACK_SUCCESS,
    RECORD_EXCHANGE_FEEDBACK_FAILURE,
    COMPLETE_SKILL_QUEST_OBJECTIVE_REQUEST,
    COMPLETE_SKILL_QUEST_OBJECTIVE_SUCCESS,
    COMPLETE_SKILL_QUEST_OBJECTIVE_FAILURE,
    CONNECT_FOR_EXCHANGE_REQUEST,
    CONNECT_FOR_EXCHANGE_SUCCESS,
    CONNECT_FOR_EXCHANGE_FAILURE,
    ADVANCED_SKILL_SEARCH_REQUEST,
    ADVANCED_SKILL_SEARCH_SUCCESS,
    ADVANCED_SKILL_SEARCH_FAILURE,
    ADVANCED_SEARCH_REQUEST,
    ADVANCED_SEARCH_SUCCESS,
    ADVANCED_SEARCH_FAILURE,
    CANCEL_EXCHANGE_REQUEST,
    CANCEL_EXCHANGE_SUCCESS,
    CANCEL_EXCHANGE_FAILURE,
    CREATE_REVIEW_REQUEST,
    CREATE_REVIEW_SUCCESS,
    CREATE_REVIEW_FAILURE,
    GET_REVIEWS_FOR_USER_REQUEST,
    GET_REVIEWS_FOR_USER_SUCCESS,
    GET_REVIEWS_FOR_USER_FAILURE,
    GET_REVIEWS_FOR_EXCHANGE_REQUEST,
    GET_REVIEWS_FOR_EXCHANGE_SUCCESS,
    GET_REVIEWS_FOR_EXCHANGE_FAILURE,
    UPDATE_REVIEW_REQUEST,
    UPDATE_REVIEW_SUCCESS,
    UPDATE_REVIEW_FAILURE,
    DELETE_REVIEW_REQUEST,
    DELETE_REVIEW_SUCCESS,
    DELETE_REVIEW_FAILURE,
  } from '../actions/exchangeActions';
  
  const initialState = {
    exchanges: [],
    currentExchange: null,
    analytics: null,
    suggestedMatches: [],
    skillCircles: [],
    globalSkillDemand: null,
    skillQuest: null,
    skillHeatMap: null,
    localChapters: [],
    offlineExchanges: [],
    loading: false,
    error: null,
    advancedSearchResults: null,
    reviews: [],
    userReviews: {},
    exchangeReviews: {},
  };
  
  const deepCopy = (obj) => {
    if (typeof obj !== 'object' || obj === null) {
      return obj;
    }
  
    if (Array.isArray(obj)) {
      return obj.map(deepCopy);
    }
  
    return Object.fromEntries(
      Object.entries(obj).map(([key, value]) => [key, deepCopy(value)])
    );
  };
  
  
  const exchangeReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_EXCHANGES_REQUEST:
      case CREATE_EXCHANGE_REQUEST:
      case GET_EXCHANGE_REQUEST:
      case RESPOND_TO_EXCHANGE_REQUEST:
      case COMPLETE_EXCHANGE_REQUEST:
      case FETCH_EXCHANGE_ANALYTICS_REQUEST:
      case SUGGEST_EXCHANGE_MATCHES_REQUEST:
      case CREATE_SKILL_CIRCLE_REQUEST:
      case GET_GLOBAL_SKILL_DEMAND_REQUEST:
      case GENERATE_SKILL_QUEST_REQUEST:
      case GET_SKILL_HEAT_MAP_REQUEST:
      case INVITE_TO_SKILL_CIRCLE_REQUEST:
      case RESPOND_TO_SKILL_CIRCLE_INVITATION_REQUEST:
      case GET_SKILL_CIRCLE_DETAILS_REQUEST:
      case SETUP_LOCAL_CHAPTER_REQUEST:
      case JOIN_LOCAL_CHAPTER_REQUEST:
      case ORGANIZE_OFFLINE_EXCHANGE_REQUEST:
      case RECORD_EXCHANGE_FEEDBACK_REQUEST:
      case COMPLETE_SKILL_QUEST_OBJECTIVE_REQUEST:
        return { ...state, loading: true, error: null };
  
        case FETCH_EXCHANGES_SUCCESS:
          return { 
            ...state, 
            loading: false, 
            exchanges: action.payload.map(newExchange => {
              const existingExchange = state.exchanges.find(e => e.id === newExchange.id);
              return existingExchange ? { ...existingExchange, ...newExchange } : newExchange;
            }),
            error: null 
          };
        
        case FETCH_EXCHANGES_FAILURE:
          return { 
            ...state, 
            loading: false, 
            error: action.payload 
          };
  
      case CREATE_EXCHANGE_SUCCESS:
        return { ...state, loading: false, exchanges: [...state.exchanges, action.payload] };
  
      case GET_EXCHANGE_SUCCESS:
        return { ...state, loading: false, currentExchange: action.payload };
  
      case RESPOND_TO_EXCHANGE_SUCCESS:
      case COMPLETE_EXCHANGE_SUCCESS:
        return {
          ...state,
          loading: false,
          exchanges: state.exchanges.map(exchange =>
            exchange.id === action.payload.id ? action.payload : exchange
          ),
          currentExchange: action.payload,
        };
  
  
      case FETCH_EXCHANGE_ANALYTICS_SUCCESS:
        return { ...state, loading: false, analytics: action.payload };
  
      case SUGGEST_EXCHANGE_MATCHES_SUCCESS:
        return { ...state, loading: false, suggestedMatches: action.payload };
  
      case CREATE_SKILL_CIRCLE_SUCCESS:
        return { ...state, loading: false, skillCircles: [...state.skillCircles, action.payload] };
  
      case GET_GLOBAL_SKILL_DEMAND_SUCCESS:
        return { ...state, loading: false, globalSkillDemand: action.payload };
  
      case GENERATE_SKILL_QUEST_SUCCESS:
        return { ...state, loading: false, skillQuest: action.payload };
  
      case GET_SKILL_HEAT_MAP_SUCCESS:
        return { ...state, loading: false, skillHeatMap: action.payload };
  
      case INVITE_TO_SKILL_CIRCLE_SUCCESS:
        return {
          ...state,
          loading: false,
          skillCircles: state.skillCircles.map(circle =>
            circle.id === action.payload.circleId
              ? { ...circle, invitations: [...circle.invitations, action.payload] }
              : circle
          ),
        };
  
      case RESPOND_TO_SKILL_CIRCLE_INVITATION_SUCCESS:
        return {
          ...state,
          loading: false,
          skillCircles: state.skillCircles.map(circle =>
            circle.id === action.payload.circleId
              ? {
                  ...circle,
                  invitations: circle.invitations.map(inv =>
                    inv.id === action.payload.id ? action.payload : inv
                  ),
                }
              : circle
          ),
        };
  
      case GET_SKILL_CIRCLE_DETAILS_SUCCESS:
        return {
          ...state,
          loading: false,
          skillCircles: state.skillCircles.map(circle =>
            circle.id === action.payload.id ? action.payload : circle
          ),
        };
  
      case SETUP_LOCAL_CHAPTER_SUCCESS:
        return { ...state, loading: false, localChapters: [...state.localChapters, action.payload] };
  
      case JOIN_LOCAL_CHAPTER_SUCCESS:
        return {
          ...state,
          loading: false,
          localChapters: state.localChapters.map(chapter =>
            chapter.id === action.payload.chapterId
              ? { ...chapter, members: [...chapter.members, action.payload.user] }
              : chapter
          ),
        };
  
      case ORGANIZE_OFFLINE_EXCHANGE_SUCCESS:
        return {
          ...state,
          loading: false,
          offlineExchanges: [...state.offlineExchanges, action.payload],
        };
  
      case RECORD_EXCHANGE_FEEDBACK_SUCCESS:
        return {
          ...state,
          loading: false,
          exchanges: state.exchanges.map(exchange =>
            exchange.id === action.payload.exchangeId
              ? { ...exchange, feedback: [...exchange.feedback, action.payload] }
              : exchange
          ),
        };
  
      case COMPLETE_SKILL_QUEST_OBJECTIVE_SUCCESS:
        return {
          ...state,
          loading: false,
          skillQuest: action.payload,
        };
  
        case CONNECT_FOR_EXCHANGE_REQUEST:
          return { ...state, loading: true, error: null };
        
          case CONNECT_FOR_EXCHANGE_SUCCESS:
            return {
              ...state,
              loading: false,
              exchanges: [...state.exchanges, action.payload],
              error: null
            };
        
        case CONNECT_FOR_EXCHANGE_FAILURE:
          return { ...state, loading: false, error: action.payload };
  
          case ADVANCED_SKILL_SEARCH_REQUEST:
            return { ...state, loading: true, error: null };
      
          case ADVANCED_SKILL_SEARCH_SUCCESS:
            return { 
              ...state, 
              loading: false, 
              advancedSearchResults: action.payload,
              error: null 
            };
      
          case ADVANCED_SKILL_SEARCH_FAILURE:
            return { ...state, loading: false, error: action.payload };
  
            case ADVANCED_SEARCH_REQUEST:
              return { ...state, loading: true, error: null };
              case ADVANCED_SEARCH_SUCCESS:
                return { 
                  ...state, 
                  loading: false, 
                  advancedSearchResults: deepCopy(action.payload),
                  error: null 
                };
            case ADVANCED_SEARCH_FAILURE:
              return { ...state, loading: false, error: action.payload };
  
  
  
      case CREATE_EXCHANGE_FAILURE:
      case GET_EXCHANGE_FAILURE:
      case RESPOND_TO_EXCHANGE_FAILURE:
      case COMPLETE_EXCHANGE_FAILURE:
      case FETCH_EXCHANGE_ANALYTICS_FAILURE:
      case SUGGEST_EXCHANGE_MATCHES_FAILURE:
      case CREATE_SKILL_CIRCLE_FAILURE:
      case GET_GLOBAL_SKILL_DEMAND_FAILURE:
      case GENERATE_SKILL_QUEST_FAILURE:
      case GET_SKILL_HEAT_MAP_FAILURE:
      case INVITE_TO_SKILL_CIRCLE_FAILURE:
      case RESPOND_TO_SKILL_CIRCLE_INVITATION_FAILURE:
      case GET_SKILL_CIRCLE_DETAILS_FAILURE:
      case SETUP_LOCAL_CHAPTER_FAILURE:
      case JOIN_LOCAL_CHAPTER_FAILURE:
      case ORGANIZE_OFFLINE_EXCHANGE_FAILURE:
      case RECORD_EXCHANGE_FEEDBACK_FAILURE:
      case COMPLETE_SKILL_QUEST_OBJECTIVE_FAILURE:
        return { ...state, loading: false, error: action.payload };
  
        case CANCEL_EXCHANGE_REQUEST:
          case CREATE_REVIEW_REQUEST:
          case GET_REVIEWS_FOR_USER_REQUEST:
          case GET_REVIEWS_FOR_EXCHANGE_REQUEST:
          case UPDATE_REVIEW_REQUEST:
          case DELETE_REVIEW_REQUEST:
            return { ...state, loading: true, error: null };
      
            case CANCEL_EXCHANGE_SUCCESS:
              return {
                ...state,
                loading: false,
                exchanges: state.exchanges.map(exchange =>
                  exchange.id === action.payload ? { ...exchange, status: 'cancelled' } : exchange
                ),
                cancelError: null,
              };
      
          case CREATE_REVIEW_SUCCESS:
            return {
              ...state,
              loading: false,
              reviews: [...state.reviews, action.payload],
              exchangeReviews: {
                ...state.exchangeReviews,
                [action.payload.exchangeId]: [
                  ...(state.exchangeReviews[action.payload.exchangeId] || []),
                  action.payload
                ],
              },
            };
      
          case GET_REVIEWS_FOR_USER_SUCCESS:
            return {
              ...state,
              loading: false,
              userReviews: {
                ...state.userReviews,
                [action.payload.userId]: action.payload.reviews,
              },
            };
      
          case GET_REVIEWS_FOR_EXCHANGE_SUCCESS:
            return {
              ...state,
              loading: false,
              exchangeReviews: {
                ...state.exchangeReviews,
                [action.payload.exchangeId]: action.payload.reviews,
              },
            };
      
          case UPDATE_REVIEW_SUCCESS:
            return {
              ...state,
              loading: false,
              reviews: state.reviews.map(review =>
                review.id === action.payload.id ? action.payload : review
              ),
              exchangeReviews: {
                ...state.exchangeReviews,
                [action.payload.exchangeId]: state.exchangeReviews[action.payload.exchangeId].map(review =>
                  review.id === action.payload.id ? action.payload : review
                ),
              },
            };
      
          case DELETE_REVIEW_SUCCESS:
            return {
              ...state,
              loading: false,
              reviews: state.reviews.filter(review => review.id !== action.payload),
              exchangeReviews: Object.fromEntries(
                Object.entries(state.exchangeReviews).map(([exchangeId, reviews]) => [
                  exchangeId,
                  reviews.filter(review => review.id !== action.payload)
                ])
              ),
            };
      
          case CANCEL_EXCHANGE_FAILURE:
          case CREATE_REVIEW_FAILURE:
          case GET_REVIEWS_FOR_USER_FAILURE:
          case GET_REVIEWS_FOR_EXCHANGE_FAILURE:
          case UPDATE_REVIEW_FAILURE:
          case DELETE_REVIEW_FAILURE:
            return { ...state, loading: false, error: action.payload };
  
      default:
        return state;
    }
  };
  
  export default exchangeReducer;