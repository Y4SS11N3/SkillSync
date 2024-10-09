import {
    INITIALIZE_SESSION,
    JOIN_SESSION,
    END_SESSION,
    TOGGLE_AUDIO,
    TOGGLE_VIDEO,
    START_SCREEN_SHARE,
    STOP_SCREEN_SHARE,
    PARTICIPANT_JOINED,
    PARTICIPANT_LEFT,
    SESSION_ENDED,
    AUDIO_TOGGLED,
    VIDEO_TOGGLED,
    SCREEN_SHARE_STARTED,
    SCREEN_SHARE_STOPPED,
    SET_ERROR,
    SEND_LIVE_EXCHANGE_INVITATION,
    ACCEPT_LIVE_EXCHANGE_INVITATION,
    DECLINE_LIVE_EXCHANGE_INVITATION,
    RECEIVE_LIVE_EXCHANGE_INVITATION,
    SESSION_STATE_UPDATED,
    INVITATION_ACCEPTED,
    RECEIVE_SIGNAL,
    WEBRTC_CONNECTION_INITIALIZED,
    LOCAL_STREAM_RECEIVED,
    REMOTE_STREAM_RECEIVED,
    UPDATE_CONNECTION_STATUS,
    SYNC_EDITOR_OPERATION_RECEIVED,
    RECEIVE_CHAT_MESSAGE,
    SEND_CHAT_MESSAGE,
    SET_SESSION_DETAILS,
  } from '../actions/liveExchangeActions';
  
  const initialState = {
    session: null,
    isAudioEnabled: true,
    isVideoEnabled: true,
    isScreenSharing: false,
    participants: {},
    error: null,
    pendingInvitations: [],
    sentInvitations: [],
    listenersSetup: false,
    isInitiator: false,
    peerConnection: null,
    localStream: null,
    remoteStream: null,
    webRTCStatus: 'disconnected',
    isScreenSharing: false,
    isLocalScreenSharing: false,
    isRemoteScreenSharing: false,
    syncEditorContent: '',
    chatMessages: [],
  };
  
  const liveExchangeReducer = (state = initialState, action) => {
    switch (action.type) {
      case INITIALIZE_SESSION:
        return {
          ...state,
          session: action.payload,
          participants: {},
          error: null,
          isInitiator: action.payload.isInitiator
        };
        case JOIN_SESSION:
          return {
            ...state,
            session: action.payload,
            participants: {
              ...state.participants,
              [action.payload.initiatorId]: {
                userId: action.payload.initiatorId,
                isAudioEnabled: state.isAudioEnabled,
                isVideoEnabled: state.isVideoEnabled,
                isScreenSharing: state.isScreenSharing
              }
            },
            error: null,
            isInitiator: action.payload.isInitiator
          };
          case SESSION_STATE_UPDATED:
            return {
              ...state,
              session: {
                ...state.session,
                ...action.payload
              },
              participants: {
                ...state.participants,
                ...action.payload.participants
              }
            };
            case INVITATION_ACCEPTED:
              return {
                ...state,
                session: {
                  ...state.session,
                  ...action.payload
                },
                sentInvitations: state.sentInvitations.filter(
                  invitation => invitation.id !== action.payload.invitationId
                )
              };
              case SYNC_EDITOR_OPERATION_RECEIVED:
                return {
                  ...state,
                  syncEditorContent: action.payload.data,
                };
                case RECEIVE_CHAT_MESSAGE:
                  console.log('Received chat message in reducer:', action.payload);
                  return {
                    ...state,
                    chatMessages: [...state.chatMessages, {
                      sender: action.payload.from,
                      message: action.payload.message,
                      timestamp: new Date(action.payload.timestamp).toISOString()
                    }]
                  };
                  case SEND_CHAT_MESSAGE:
    console.log('Sent chat message in reducer:', action.payload);
    return {
      ...state,
      chatMessages: [...state.chatMessages, {
        sender: action.payload.sender,
        message: action.payload.message,
        timestamp: action.payload.timestamp
      }]
    };
    case SET_SESSION_DETAILS:
      return {
        ...state,
        session: {
          ...state.session,
          ...action.payload
        }
      };
      case END_SESSION:
      case SESSION_ENDED:
        return initialState;
      case TOGGLE_AUDIO:
        return {
          ...state,
          isAudioEnabled: action.payload.isAudioEnabled,
          participants: {
            ...state.participants,
            [action.payload.userId]: {
              ...state.participants[action.payload.userId],
              isAudioEnabled: action.payload.isAudioEnabled
            }
          }
        };
      case TOGGLE_VIDEO:
        return {
          ...state,
          isVideoEnabled: action.payload.isVideoEnabled,
          participants: {
            ...state.participants,
            [action.payload.userId]: {
              ...state.participants[action.payload.userId],
              isVideoEnabled: action.payload.isVideoEnabled
            }
          }
        };
        case START_SCREEN_SHARE:
          return {
            ...state,
            isScreenSharing: true,
            isLocalScreenSharing: true,
          };
    
        case STOP_SCREEN_SHARE:
          return {
            ...state,
            isScreenSharing: false,
            isLocalScreenSharing: false,
          };
    
        case 'SET_LOCAL_SCREEN_SHARING':
          return {
            ...state,
            isLocalScreenSharing: action.payload,
          };
          case 'UPDATE_SCREEN_SHARE_STREAM':
            return { ...state, localScreenShareStream: action.payload };
        case 'SCREEN_SHARE_ERROR':
          return { ...state, isScreenSharing: false, error: action.payload };
        case PARTICIPANT_JOINED:
          return {
            ...state,
            participants: {
              ...state.participants,
              [action.payload.userId]: {
                ...action.payload,
                ...state.participants[action.payload.userId]
              }
            }
          };
      case PARTICIPANT_LEFT:
        const { [action.payload.userId]: removedParticipant, ...remainingParticipants } = state.participants;
        return {
          ...state,
          participants: remainingParticipants
        };
      case AUDIO_TOGGLED:
      case VIDEO_TOGGLED:
        case SCREEN_SHARE_STARTED:
          return {
            ...state,
            isRemoteScreenSharing: true,
            participants: {
              ...state.participants,
              [action.payload.userId]: {
                ...state.participants[action.payload.userId],
                isScreenSharing: true,
              },
            },
          };
    
    
          case SCREEN_SHARE_STOPPED:
            return {
              ...state,
              isRemoteScreenSharing: false,
              participants: {
                ...state.participants,
                [action.payload.userId]: {
                  ...state.participants[action.payload.userId],
                  isScreenSharing: false,
                },
              },
            };
      case SET_ERROR:
        return {
          ...state,
          error: action.payload
        };
      case SEND_LIVE_EXCHANGE_INVITATION:
        return {
          ...state,
          sentInvitations: [...state.sentInvitations, action.payload]
        };
      case RECEIVE_LIVE_EXCHANGE_INVITATION:
        return {
          ...state,
          pendingInvitations: [...state.pendingInvitations, action.payload]
        };
        case ACCEPT_LIVE_EXCHANGE_INVITATION:
          return {
            ...state,
            pendingInvitations: state.pendingInvitations.filter(
              invitation => invitation.id !== action.payload.id
            ),
            session: action.payload,
            isInitiator: false
          };
      case DECLINE_LIVE_EXCHANGE_INVITATION:
        return {
          ...state,
          pendingInvitations: state.pendingInvitations.filter(
            invitation => invitation.id !== action.payload.id
          )
        };
        case 'SET_LISTENERS_SETUP':
          return {
            ...state,
            listenersSetup: action.payload
          };
          case 'LOCAL_STREAM_RECEIVED':
            return {
              ...state,
              localStreamId: action.payload
            };
          
          case 'REMOTE_STREAM_RECEIVED':
            return {
              ...state,
              remoteStreamId: action.payload.id
            };
          
          case 'WEBRTC_CONNECTION_INITIALIZED':
            return {
              ...state,
              webRTCStatus: action.payload
            };
      
          case RECEIVE_SIGNAL:
            return {
              ...state,
              lastReceivedSignal: action.payload,
              webRTCStatus: action.payload.signal.type === 'answer' ? 'connected' : state.webRTCStatus,
            };
            case UPDATE_CONNECTION_STATUS:
              return {
                ...state,
                connectionStatus: action.payload
              };
        default:
          return state;
      }
    };
  
  export default liveExchangeReducer;