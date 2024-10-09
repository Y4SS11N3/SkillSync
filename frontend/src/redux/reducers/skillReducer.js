import {
    FETCH_SKILLS_REQUEST,
    FETCH_SKILLS_SUCCESS,
    FETCH_SKILLS_FAILURE,
    GET_SKILL_REQUEST,
    GET_SKILL_SUCCESS,
    GET_SKILL_FAILURE,
    CREATE_SKILL_REQUEST,
    CREATE_SKILL_SUCCESS,
    CREATE_SKILL_FAILURE,
    UPDATE_SKILL_REQUEST,
    UPDATE_SKILL_SUCCESS,
    UPDATE_SKILL_FAILURE,
    DELETE_SKILL_REQUEST,
    DELETE_SKILL_SUCCESS,
    DELETE_SKILL_FAILURE,
    GET_SKILL_TOKEN_INFO_REQUEST,
    GET_SKILL_TOKEN_INFO_SUCCESS,
    GET_SKILL_TOKEN_INFO_FAILURE,
    GET_SKILL_HEATMAP_REQUEST,
    GET_SKILL_HEATMAP_SUCCESS,
    GET_SKILL_HEATMAP_FAILURE,
    GET_SKILL_TRENDS_REQUEST,
    GET_SKILL_TRENDS_SUCCESS,
    GET_SKILL_TRENDS_FAILURE,
    GET_RELATED_SKILLS_REQUEST,
    GET_RELATED_SKILLS_SUCCESS,
    GET_RELATED_SKILLS_FAILURE,
    GET_SKILL_STATISTICS_REQUEST,
    GET_SKILL_STATISTICS_SUCCESS,
    GET_SKILL_STATISTICS_FAILURE,
    GET_TOP_SKILLS_IN_AREA_REQUEST,
    GET_TOP_SKILLS_IN_AREA_SUCCESS,
    GET_TOP_SKILLS_IN_AREA_FAILURE,
    SET_SKILLS,
    SET_SELECTED_SKILL,
    CLEAR_SEARCH_RESULTS,
    INITIATE_SKILL_EXCHANGE_REQUEST,
    INITIATE_SKILL_EXCHANGE_SUCCESS,
    INITIATE_SKILL_EXCHANGE_FAILURE,
    GET_TRENDING_SKILLS_REQUEST,
    GET_TRENDING_SKILLS_SUCCESS,
    GET_TRENDING_SKILLS_FAILURE,
    SEARCH_SKILLS_REQUEST,
    SEARCH_SKILLS_SUCCESS,
    SEARCH_SKILLS_FAILURE,
    ADVANCED_SEARCH_REQUEST,
    ADVANCED_SEARCH_SUCCESS,
    ADVANCED_SEARCH_FAILURE,
    DELETE_USER_SKILL_REQUEST,
    DELETE_USER_SKILL_SUCCESS,
    DELETE_USER_SKILL_FAILURE,
    FETCH_USER_SKILLS_SUCCESS,
  } from '../actions/skillActions';
  
  const initialState = {
    skills: [],
    userSkills: [], 
    selectedSkill: null,
    relatedSkills: [],
    skillTokenInfo: null,
    skillHeatMap: [],
    skillTrends: [],
    trendingSkills: [],
    skillStatistics: null,
    topSkillsInArea: [],
    loading: false,
    error: null,
    pagination: {
      currentPage: 1,
      totalPages: 1,
      totalItems: 0,
      itemsPerPage: 20
    }
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
  
  const skillReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_SKILLS_REQUEST:
      case GET_SKILL_REQUEST:
      case CREATE_SKILL_REQUEST:
      case UPDATE_SKILL_REQUEST:
      case DELETE_SKILL_REQUEST:
      case GET_SKILL_TOKEN_INFO_REQUEST:
      case GET_SKILL_HEATMAP_REQUEST:
      case GET_SKILL_TRENDS_REQUEST:
      case GET_RELATED_SKILLS_REQUEST:
      case GET_SKILL_STATISTICS_REQUEST:
      case GET_TOP_SKILLS_IN_AREA_REQUEST:
      case INITIATE_SKILL_EXCHANGE_REQUEST:
        return { ...state, loading: true, error: null };
  
      case FETCH_SKILLS_SUCCESS:
        return {
          ...state,
          loading: false,
          skills: action.payload.skills,
          pagination: {
            currentPage: action.payload.currentPage,
            totalPages: action.payload.totalPages,
            totalItems: action.payload.totalItems,
            itemsPerPage: action.payload.itemsPerPage
          }
        };
  
        case FETCH_USER_SKILLS_SUCCESS:
          return {
            ...state,
            loading: false,
            userSkills: action.payload,
            error: null
          };
  
      case GET_SKILL_SUCCESS:
      case SET_SELECTED_SKILL:
        return { ...state, loading: false, selectedSkill: action.payload };
  
      case CREATE_SKILL_SUCCESS:
        return { ...state, loading: false, skills: [...state.skills, action.payload] };
  
        
      case UPDATE_SKILL_SUCCESS:
        return {
          ...state,
          loading: false,
          skills: state.skills.map(skill => 
            skill.id === action.payload.id ? action.payload : skill
          ),
          selectedSkill: action.payload
        };
  
        case SEARCH_SKILLS_REQUEST:
          case ADVANCED_SEARCH_REQUEST:
            return { ...state, loading: true, error: null, filteredSkills: [] };
          
            case SEARCH_SKILLS_SUCCESS:
              case ADVANCED_SEARCH_SUCCESS:
                return { 
                  ...state, 
                  loading: false, 
                  filteredSkills: deepCopy([
                    ...action.payload.perfectMatches,
                    ...action.payload.potentialExchanges,
                    ...action.payload.yourOfferings
                  ]),
                  error: null 
                };
          
          case SEARCH_SKILLS_FAILURE:
          case ADVANCED_SEARCH_FAILURE:
            return { ...state, loading: false, error: action.payload, filteredSkills: [] };
          
          case CLEAR_SEARCH_RESULTS:
            return { ...state, filteredSkills: [], error: null };
  
      case DELETE_SKILL_SUCCESS:
        return {
          ...state,
          loading: false,
          skills: state.skills.filter(skill => skill.id !== action.payload),
          selectedSkill: state.selectedSkill && state.selectedSkill.id === action.payload ? null : state.selectedSkill
        };
  
        case CREATE_SKILL_SUCCESS:
          return { 
            ...state, 
            loading: false, 
            userSkills: [...state.userSkills, action.payload] 
          };      
  
      case GET_SKILL_TOKEN_INFO_SUCCESS:
        return { ...state, loading: false, skillTokenInfo: action.payload };
  
      case GET_SKILL_HEATMAP_SUCCESS:
        return { ...state, loading: false, skillHeatMap: action.payload };
  
      case GET_SKILL_TRENDS_SUCCESS:
        return { ...state, loading: false, skillTrends: action.payload };
  
      case GET_RELATED_SKILLS_SUCCESS:
        return { ...state, loading: false, relatedSkills: action.payload };
  
      case GET_SKILL_STATISTICS_SUCCESS:
        return { ...state, loading: false, skillStatistics: action.payload };
  
      case GET_TOP_SKILLS_IN_AREA_SUCCESS:
        return { ...state, loading: false, topSkillsInArea: action.payload };
  
      case INITIATE_SKILL_EXCHANGE_SUCCESS:
        return { ...state, loading: false };
  
      case FETCH_SKILLS_FAILURE:
      case GET_SKILL_FAILURE:
      case CREATE_SKILL_FAILURE:
      case UPDATE_SKILL_FAILURE:
      case DELETE_SKILL_FAILURE:
      case GET_SKILL_TOKEN_INFO_FAILURE:
      case GET_SKILL_HEATMAP_FAILURE:
      case GET_SKILL_TRENDS_FAILURE:
      case GET_RELATED_SKILLS_FAILURE:
      case GET_SKILL_STATISTICS_FAILURE:
      case GET_TOP_SKILLS_IN_AREA_FAILURE:
      case INITIATE_SKILL_EXCHANGE_FAILURE:
        return { ...state, loading: false, error: action.payload };
  
      case SET_SKILLS:
        return { ...state, skills: action.payload };
  
      case CLEAR_SEARCH_RESULTS:
        return { ...state, skills: [] };
  
        case GET_TRENDING_SKILLS_REQUEST:
          console.log('GET_TRENDING_SKILLS_REQUEST');
          return { ...state, loading: true, error: null };
        case GET_TRENDING_SKILLS_SUCCESS:
          console.log('GET_TRENDING_SKILLS_SUCCESS', action.payload);
          return { ...state, loading: false, trendingSkills: action.payload };
        case GET_TRENDING_SKILLS_FAILURE:
          console.log('GET_TRENDING_SKILLS_FAILURE', action.payload);
          return { ...state, loading: false, error: action.payload };
  
          case DELETE_USER_SKILL_REQUEST:
            return { ...state, loading: true, error: null };
          
            case DELETE_USER_SKILL_SUCCESS:
              return {
                ...state,
                loading: false,
                skills: state.skills ? state.skills.filter(skill => skill.id !== action.payload) : [],
                userSkills: state.userSkills ? state.userSkills.filter(skill => skill.id !== action.payload) : [],
              };
          
          case DELETE_USER_SKILL_FAILURE:
            return { ...state, loading: false, error: action.payload };
  
      default:
        return state;
    }
  };
  
  export default skillReducer;