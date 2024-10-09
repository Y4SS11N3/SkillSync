import {
    INITIALIZE_SOCKET,
    GET_CHAT_SUCCESS,
    GET_MESSAGES_SUCCESS,
    SEND_MESSAGE_SUCCESS,
    RECEIVE_MESSAGE,
    CHAT_ERROR,
    OPEN_CHAT,
    SEND_LIVE_EXCHANGE_INVITATION_SUCCESS,
    RECEIVE_LIVE_EXCHANGE_INVITATION
  } from '../actions/chatActions';
  
  const initialState = {
    socket: null,
    currentChat: null,
    messages: {},
    error: null,
  };
  
  const updateMessages = (state, payload) => {
    const chatId = payload.chatId;
    const updatedMessages = [
      ...(state.messages[chatId] || []),
      payload
    ].filter((message, index, self) =>
      index === self.findIndex((t) => t.id === message.id)
    );
    return {
      ...state,
      messages: {
        ...state.messages,
        [chatId]: updatedMessages,
      },
    };
  };
  
  const chatReducer = (state = initialState, action) => {
    switch (action.type) {
      case INITIALIZE_SOCKET:
        return {
          ...state,
          socket: action.payload,
        };
      case GET_CHAT_SUCCESS:
      case OPEN_CHAT:
        return {
          ...state,
          currentChat: action.payload,
          error: null,
        };
      case GET_MESSAGES_SUCCESS:
        return {
          ...state,
          messages: {
            ...state.messages,
            [action.payload.chatId]: action.payload.messages,
          },
          error: null,
        };
      case SEND_MESSAGE_SUCCESS:
      case RECEIVE_MESSAGE:
      case SEND_LIVE_EXCHANGE_INVITATION_SUCCESS:
      case RECEIVE_LIVE_EXCHANGE_INVITATION:
        return updateMessages(state, action.payload);
      case CHAT_ERROR:
        console.error('Chat error:', action.payload);
        return {
          ...state,
          error: action.payload,
        };
      default:
        return state;
    }
  };
  
  export default chatReducer;