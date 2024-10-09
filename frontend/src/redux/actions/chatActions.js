import chatService from '../../services/chatService';

// Action Types
export const INITIALIZE_SOCKET = 'INITIALIZE_SOCKET';
export const GET_CHAT_SUCCESS = 'GET_CHAT_SUCCESS';
export const GET_MESSAGES_SUCCESS = 'GET_MESSAGES_SUCCESS';
export const SEND_MESSAGE_SUCCESS = 'SEND_MESSAGE_SUCCESS';
export const RECEIVE_MESSAGE = 'RECEIVE_MESSAGE';
export const CHAT_ERROR = 'CHAT_ERROR';
export const OPEN_CHAT = 'OPEN_CHAT';
export const SEND_LIVE_EXCHANGE_INVITATION_SUCCESS = 'SEND_LIVE_EXCHANGE_INVITATION_SUCCESS';
export const RECEIVE_LIVE_EXCHANGE_INVITATION = 'RECEIVE_LIVE_EXCHANGE_INVITATION';

let socket;

/**
 * Parses the message content, handling potential encoding issues.
 * @param {string|object} content - The message content to parse.
 * @returns {object|string} The parsed content.
 */
const parseMessageContent = (content) => {
  if (typeof content === 'string') {
    try {
      const decodedContent = content
        .replace(/&quot;/g, '"')
        .replace(/&#x5C;/g, '\\')
        .replace(/&amp;/g, '&')
        .replace(/&lt;/g, '<')
        .replace(/&gt;/g, '>')
        .replace(/&#39;/g, "'")
        .replace(/\\n/g, '\n');
      
      return JSON.parse(decodedContent);
    } catch (error) {
      console.error('Error parsing message content:', error);
      return content;
    }
  }
  return content;
};

/**
 * Initializes the socket connection.
 * @param {string} token - The authentication token.
 * @returns {Function} Thunk function.
 */
export const initializeSocket = (token) => (dispatch) => {
  return chatService.initSocket(token)
    .then((newSocket) => {
      socket = newSocket;
      dispatch({ type: INITIALIZE_SOCKET, payload: { connected: true } });
      return socket;
    })
    .catch((error) => {
      console.error('Error initializing socket:', error);
      dispatch({ type: INITIALIZE_SOCKET, payload: { connected: false } });
      throw error;
    });
};

/**
 * Retrieves chat by exchange ID.
 * @param {string} exchangeId - The exchange ID.
 * @returns {Function} Thunk function.
 */
export const getChatByExchange = (exchangeId) => async (dispatch) => {
  try {
    const chat = await chatService.getChatByExchange(exchangeId);
    dispatch({ type: GET_CHAT_SUCCESS, payload: chat });
    return chat;
  } catch (error) {
    console.error('Error getting chat by exchange:', error);
    dispatch({ type: CHAT_ERROR, payload: error.message });
    throw error;
  }
};

/**
 * Retrieves messages for a specific chat.
 * @param {string} chatId - The chat ID.
 * @returns {Function} Thunk function.
 */
export const getMessages = (chatId) => async (dispatch) => {
  try {
    const messages = await chatService.getMessages(chatId);
    
    const parsedMessages = messages.map(message => ({
      ...message,
      content: parseMessageContent(message.content)
    }));
    
    dispatch({ type: GET_MESSAGES_SUCCESS, payload: { chatId, messages: parsedMessages } });
    return parsedMessages;
  } catch (error) {
    console.error('Error getting messages:', error);
    dispatch({ type: CHAT_ERROR, payload: error.message });
    throw error;
  }
};

/**
 * Sends a message in a specific chat.
 * @param {string} chatId - The chat ID.
 * @param {string|object} content - The message content.
 * @returns {Function} Thunk function.
 */
export const sendMessage = (chatId, content) => async (dispatch) => {
  try {
    let messageContent = content;
    if (typeof content === 'object') {
      messageContent = JSON.stringify(content);
    }
    const message = await chatService.sendMessage(chatId, messageContent);
    
    message.content = parseMessageContent(message.content);
    
    dispatch({ type: SEND_MESSAGE_SUCCESS, payload: message });
    dispatch({ type: RECEIVE_MESSAGE, payload: message });
    return message;
  } catch (error) {
    console.error('[chatActions] Error sending message:', error);
    dispatch({ type: CHAT_ERROR, payload: error.message });
    throw error;
  }
};

/**
 * Joins a specific chat.
 * @param {string} chatId - The chat ID.
 * @returns {Function} Thunk function.
 */
export const joinChat = (chatId) => (dispatch) => {
  chatService.joinChat(chatId);
};

/**
 * Leaves a specific chat.
 * @param {string} chatId - The chat ID.
 * @returns {Function} Thunk function.
 */
export const leaveChat = (chatId) => (dispatch) => {
  chatService.leaveChat(chatId);
};

/**
 * Opens a chat for a specific exchange.
 * @param {string} exchangeId - The exchange ID.
 * @returns {Function} Thunk function.
 */
export const openChat = (exchangeId) => async (dispatch) => {
  try {
    const chat = await chatService.getChatByExchange(exchangeId);
    if (!chat || !chat.id) {
      throw new Error('Invalid chat data received from server');
    }
    dispatch({ type: OPEN_CHAT, payload: chat });
    dispatch(joinChat(chat.id));
    await dispatch(getMessages(chat.id));
    return chat;
  } catch (error) {
    console.error('Error opening chat:', error);
    dispatch({ type: CHAT_ERROR, payload: error.message });
    throw error;
  }
};

/**
 * Sends a live exchange invitation.
 * @param {string} chatId - The chat ID.
 * @param {string} exchangeId - The exchange ID.
 * @returns {Function} Thunk function.
 */
export const sendLiveExchangeInvitation = (chatId, exchangeId) => async (dispatch) => {
  try {
    const invitation = await chatService.sendLiveExchangeInvitation(chatId, exchangeId);
    dispatch({ type: SEND_LIVE_EXCHANGE_INVITATION_SUCCESS, payload: invitation });
    dispatch({ type: RECEIVE_LIVE_EXCHANGE_INVITATION, payload: invitation });
    return invitation;
  } catch (error) {
    console.error('Error sending live exchange invitation:', error);
    dispatch({ type: CHAT_ERROR, payload: error.message });
    throw error;
  }
};

/**
 * Sets up a listener for live exchange invitations.
 * @returns {Function} Thunk function.
 */
export const setupLiveExchangeInvitationListener = () => (dispatch) => {
  chatService.onLiveExchangeInvitation((invitation) => {
    dispatch({ type: RECEIVE_LIVE_EXCHANGE_INVITATION, payload: invitation });
  });
};

/**
 * Removes the listener for live exchange invitations.
 * @returns {Function} Thunk function.
 */
export const removeLiveExchangeInvitationListener = () => (dispatch) => {
  chatService.offLiveExchangeInvitation();
};