import axios from 'axios';
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: `${API_URL}`,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
      console.log('[chatService] Adding token to request:', token.substring(0, 10) + '...');
    } else {
      console.log('[chatService] No token found in localStorage');
    }
    return config;
  },
  (error) => {
    console.error('[chatService] Request interceptor error:', error);
    return Promise.reject(error);
  }
);

let socket;

/**
 * Service object containing methods for chat-related operations and WebSocket connections.
 * @namespace
 */
const chatService = {
  /**
   * Initializes the WebSocket connection.
   * @param {string} token - The authentication token.
   * @returns {Promise<Socket>} A promise that resolves with the socket instance.
   */
  initSocket: (token) => {
    return new Promise((resolve, reject) => {
      console.log('[chatService] Initializing socket with token:', token);
      socket = io(SOCKET_URL, {
        query: { token },
        transports: ['websocket'],
      });

      socket.on('connect', () => {
        console.log('[chatService] Connected to WebSocket server');
        resolve(socket);
      });

      socket.on('connect_error', (error) => {
        console.error('[chatService] Connection error:', error);
        reject(error);
      });
    });
  },

  /**
   * Joins a specific chat room.
   * @param {string} chatId - The ID of the chat to join.
   */
  joinChat: (chatId) => {
    console.log(`[chatService] Joining chat: ${chatId}`);
    if (socket && socket.connected) {
      socket.emit('join_chat', chatId);
    } else {
      console.error('[chatService] Socket is not connected. Unable to join chat.');
    }
  },

  /**
   * Leaves a specific chat room.
   * @param {string} chatId - The ID of the chat to leave.
   */
  leaveChat: (chatId) => {
    console.log(`[chatService] Leaving chat: ${chatId}`);
    if (socket && socket.connected) {
      socket.emit('leave_chat', chatId);
    } else {
      console.error('[chatService] Socket is not connected. Unable to leave chat.');
    }
  },

  /**
   * Retrieves chat information for a specific exchange.
   * @async
   * @param {string} exchangeId - The ID of the exchange.
   * @returns {Promise<Object>} The chat information.
   * @throws {Error} If there's an error retrieving the chat information.
   */
  getChatByExchange: async (exchangeId) => {
    console.log(`[chatService] Getting chat for exchange: ${exchangeId}`);
    try {
      const response = await axiosInstance.get(`/chat/exchange/${exchangeId}`);
      console.log('[chatService] Got chat:', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('[chatService] Error getting chat by exchange:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  /**
   * Retrieves messages for a specific chat.
   * @async
   * @param {string} chatId - The ID of the chat.
   * @returns {Promise<Array>} An array of messages.
   * @throws {Error} If there's an error retrieving the messages.
   */
  getMessages: async (chatId) => {
    console.log(`[chatService] Getting messages for chat: ${chatId}`);
    try {
      const response = await axiosInstance.get(`/chat/${chatId}/messages`);
      console.log('[chatService] Raw response from server:', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('[chatService] Error getting messages:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  /**
   * Sends a message to a specific chat.
   * @async
   * @param {string} chatId - The ID of the chat.
   * @param {string} content - The content of the message.
   * @returns {Promise<Object>} The sent message data.
   * @throws {Error} If there's an error sending the message.
   */
  sendMessage: async (chatId, content) => {
    console.log(`[chatService] Sending message to chat ${chatId}:`, content);
    try {
      const response = await axios.post(`${API_URL}/chat/send`, { chatId, content });
      console.log('[chatService] Message sent, server response:', response.data);
      
      if (socket && socket.connected) {
        socket.emit('new_message', response.data);
      } else {
        console.warn('[chatService] Socket is not connected. Unable to emit new_message event.');
      }
      
      return response.data;
    } catch (error) {
      console.error('[chatService] Error sending message:', error);
      throw error;
    }
  },

  /**
   * Sends a live exchange invitation.
   * @async
   * @param {string} chatId - The ID of the chat.
   * @param {string} exchangeId - The ID of the exchange.
   * @returns {Promise<Object>} The invitation data.
   * @throws {Error} If there's an error sending the invitation.
   */
  sendLiveExchangeInvitation: async (chatId, exchangeId) => {
    console.log(`[chatService] Sending live exchange invitation for chat ${chatId} and exchange ${exchangeId}`);
    try {
      const response = await axiosInstance.post('/chat/send-live-invitation', { chatId, exchangeId });
      console.log('[chatService] Live exchange invitation sent, server response:', JSON.stringify(response.data));
      return response.data;
    } catch (error) {
      console.error('[chatService] Error sending live exchange invitation:', error.response ? error.response.data : error.message);
      throw error;
    }
  },

  /**
   * Sets up a listener for new messages.
   * @param {Function} callback - The function to call when a new message is received.
   */
  onNewMessage: (callback) => {
    console.log('[chatService] Setting up new message listener');
    if (socket && socket.connected) {
      socket.on('new_message', (message) => {
        console.log('[chatService] New message received:', message);
        callback(message);
      });
    } else {
      console.error('[chatService] Socket is not connected. Unable to listen for new messages.');
    }
  },

  /**
   * Removes the listener for new messages.
   * @param {Function} callback - The function to remove from the listener.
   */
  offNewMessage: (callback) => {
    console.log('[chatService] Removing new message listener');
    if (socket && socket.connected) {
      socket.off('new_message', callback);
      console.log('[chatService] New message listener removed successfully');
    } else {
      console.error('[chatService] Socket is not connected. Unable to remove listener for new messages. Socket status:', socket ? socket.connected : 'undefined');
    }
  },

  /**
   * Sets up a listener for live exchange invitations.
   * @param {Function} callback - The function to call when a live exchange invitation is received.
   */
  onLiveExchangeInvitation: (callback) => {
    console.log('[chatService] Setting up live exchange invitation listener');
    if (socket && socket.connected) {
      socket.on('live_exchange_invitation', (invitation) => {
        console.log('[chatService] Live exchange invitation received:', JSON.stringify(invitation));
        callback(invitation);
      });
    } else {
      console.error('[chatService] Socket is not connected. Unable to listen for live exchange invitations. Socket status:', socket ? socket.connected : 'undefined');
    }
  },

  /**
   * Removes the listener for live exchange invitations.
   * @param {Function} callback - The function to remove from the listener.
   */
  offLiveExchangeInvitation: (callback) => {
    console.log('[chatService] Removing live exchange invitation listener');
    if (socket && socket.connected) {
      socket.off('live_exchange_invitation', callback);
      console.log('[chatService] Live exchange invitation listener removed successfully');
    } else {
      console.error('[chatService] Socket is not connected. Unable to remove listener for live exchange invitations. Socket status:', socket ? socket.connected : 'undefined');
    }
  }
};

export default chatService;