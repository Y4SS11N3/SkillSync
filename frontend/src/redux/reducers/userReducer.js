import {
    FETCH_USER_DATA_REQUEST,
    FETCH_USER_DATA_SUCCESS,
    FETCH_USER_DATA_FAILURE,
    UPDATE_AVATAR_REQUEST,
    UPDATE_AVATAR_SUCCESS,
    UPDATE_AVATAR_FAILURE,
    FETCH_USER_INTERESTED_SKILLS_REQUEST,
    FETCH_USER_INTERESTED_SKILLS_SUCCESS,
    FETCH_USER_INTERESTED_SKILLS_FAILURE,
    FETCH_USER_KNOWN_SKILLS_REQUEST,
    FETCH_USER_KNOWN_SKILLS_SUCCESS,
    FETCH_USER_KNOWN_SKILLS_FAILURE
  } from '../actions/userActions';
  
  const initialState = {
    userData: null,
    loading: false,
    error: null,
    avatarLoading: false,
    avatarError: null,
    interestedSkills: [],
    interestedSkillsLoading: false,
    interestedSkillsError: null
  };
  
  const userReducer = (state = initialState, action) => {
    switch (action.type) {
      case FETCH_USER_DATA_REQUEST:
        return {
          ...state,
          loading: true,
          error: null
        };
      case FETCH_USER_DATA_SUCCESS:
        return {
          ...state,
          loading: false,
          userData: action.payload,
          error: null
        };
      case FETCH_USER_DATA_FAILURE:
        return {
          ...state,
          loading: false,
          error: action.payload
        };
      case UPDATE_AVATAR_REQUEST:
        return {
          ...state,
          avatarLoading: true,
          avatarError: null
        };
      case UPDATE_AVATAR_SUCCESS:
        return {
          ...state,
          avatarLoading: false,
          userData: {
            ...state.userData,
            avatar: action.payload
          },
          avatarError: null
        };
      case UPDATE_AVATAR_FAILURE:
        return {
          ...state,
          avatarLoading: false,
          avatarError: action.payload
        };
        case FETCH_USER_INTERESTED_SKILLS_REQUEST:
          return {
            ...state,
            interestedSkillsLoading: true,
            interestedSkillsError: null
          };
        case FETCH_USER_INTERESTED_SKILLS_SUCCESS:
          return {
            ...state,
            interestedSkillsLoading: false,
            interestedSkills: action.payload,
            interestedSkillsError: null
          };
        case FETCH_USER_INTERESTED_SKILLS_FAILURE:
          return {
            ...state,
            interestedSkillsLoading: false,
            interestedSkillsError: action.payload
          };
          case FETCH_USER_KNOWN_SKILLS_REQUEST:
            return {
              ...state,
              knownSkillsLoading: true,
              knownSkillsError: null
            };
          case FETCH_USER_KNOWN_SKILLS_SUCCESS:
            return {
              ...state,
              knownSkillsLoading: false,
              knownSkills: action.payload,
              knownSkillsError: null
            };
          case FETCH_USER_KNOWN_SKILLS_FAILURE:
            return {
              ...state,
              knownSkillsLoading: false,
              knownSkillsError: action.payload
            };
        default:
          return state;
      }
    };
    
    export default userReducer;