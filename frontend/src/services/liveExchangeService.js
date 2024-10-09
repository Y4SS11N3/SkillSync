import axios from 'axios';
import io from 'socket.io-client';

const API_URL = process.env.REACT_APP_API_URL || 'http://localhost:5000';
const SOCKET_URL = process.env.REACT_APP_SOCKET_URL || 'http://localhost:5000';

const axiosInstance = axios.create({
  baseURL: `${API_URL}/live-exchange`,
  headers: {
    'Content-Type': 'application/json',
  },
});

axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

let socket;
let socketInitializationPromise = null;

/**
 * Service for managing live exchange functionality
 * @namespace liveExchangeService
 */
const liveExchangeService = {
  /**
   * Initialize the WebSocket connection
   * @async
   * @param {string} token - The authentication token
   * @returns {Promise<SocketIOClient.Socket>} The initialized socket
   */
  initSocket: async (token) => {
    if (socket && socket.connected) {
      console.log('Live exchange socket already initialized and connected');
      return Promise.resolve(socket);
    }
  
    if (socketInitializationPromise) {
      return socketInitializationPromise;
    }
  
    socketInitializationPromise = new Promise((resolve, reject) => {
      socket = io(SOCKET_URL, {
        query: { token },
        transports: ['websocket'],
        reconnection: true,
        reconnectionAttempts: 5,
        reconnectionDelay: 1000,
      });
  
      socket.on('connect', () => {
        console.log('Connected to WebSocket for live exchange');
        resolve(socket);
      });
  
      socket.on('connect_error', (error) => {
        console.error('Live exchange connection error:', error);
        reject(error);
      });
  
      socket.on('disconnect', () => {
        console.log('Disconnected from WebSocket for live exchange');
        socket = null;
        socketInitializationPromise = null;
      });
  
      socket.on('error', (error) => {
        console.error('Live exchange socket error:', error);
      });
    });
  
    try {
      await socketInitializationPromise;
      console.log('Socket initialization completed successfully');
      return socket;
    } catch (error) {
      console.error('Socket initialization failed:', error);
      socketInitializationPromise = null;
      throw error;
    }
  },

  /**
   * Initialize a live session
   * @async
   * @param {string} exchangeId - The ID of the exchange
   * @returns {Promise<Object>} The initialized session data
   */
  initializeSession: async (exchangeId) => {
    try {
      console.log('Initializing live session for exchangeId:', exchangeId);
      const response = await axiosInstance.post('/initialize', { exchangeId });
      console.log('Live session initialized:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error initializing live session:', error.response?.data || error.message);
      throw error;
    }
  },

  /**
   * Join a live session
   * @async
   * @param {string} sessionId - The ID of the session to join
   * @param {string} token - The authentication token
   * @param {string} userId - The ID of the user joining the session
   * @returns {Promise<Object>} The join session response data
   */
  joinSession: async (sessionId, token, userId) => {
    console.log('userId at start of joinSession:', userId);
    try {
      const response = await axiosInstance.post(`/${sessionId}/join`, { token });
      await liveExchangeService.ensureSocketConnection(token);
      if (socket && socket.connected) {
        console.log(`[liveExchangeService] Emitting join_live_session event: sessionId=${sessionId}, isInitiator=${response.data.isInitiator}, userId=${userId}`);
        socket.emit('join_live_session', { 
          sessionId, 
          isInitiator: response.data.isInitiator,
          userId: userId,
          token: token
        });
      } else {
        console.error('[liveExchangeService] Socket is not connected. Unable to emit join_live_session event.');
        throw new Error('Socket connection error');
      }
      return response.data;
    } catch (error) {
      console.error('[liveExchangeService] Error joining live session:', error);
      throw error;
    }
  },

  /**
   * Get details of a session
   * @async
   * @param {string} sessionId - The ID of the session
   * @returns {Promise<Object>} The session details
   */
  getSessionDetails: async (sessionId) => {
    try {
      const response = await axiosInstance.get(`/${sessionId}`);
      console.log('Fetched session details:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error fetching session details:', error);
      throw error;
    }
  },

  /**
   * Leave a live session
   * @async
   * @param {string} sessionId - The ID of the session to leave
   * @returns {Promise<void>}
   */
  leaveLiveSession: async (sessionId) => {
    await liveExchangeService.ensureSocketConnection();
    if (socket && socket.connected) {
      socket.emit('leave_live_session', sessionId);
      console.log(`Emitted leave_live_session event for session: ${sessionId}`);
    } else {
      console.error('Socket is not connected. Unable to leave live session.');
    }
  },

  /**
   * Emit ICE candidates
   * @async
   * @param {Object} params - The parameters for emitting ICE candidates
   * @param {string} params.to - The recipient of the ICE candidates
   * @param {Array} params.candidates - The ICE candidates
   * @param {string} params.sessionId - The ID of the session
   * @returns {Promise<void>}
   */
  emitIceCandidate: async ({ to, candidates, sessionId }) => {
    try {
      await liveExchangeService.ensureSocketConnection();
      if (socket && socket.connected) {
        console.log(`[liveExchangeService] Emitting ICE candidates: to=${to}, sessionId=${sessionId}`);
        socket.emit('ice_candidates', { to, candidates, sessionId });
      } else {
        throw new Error('Socket connection error');
      }
    } catch (error) {
      console.error('[liveExchangeService] Error emitting ICE candidates:', error);
      throw error;
    }
  },
  
  /**
   * Set up a listener for ICE candidates
   * @param {Function} callback - The callback function to handle received ICE candidates
   */
  onIceCandidate: (callback) => {
    if (socket && socket.connected) {
      socket.on('ice_candidate', (data) => {
        console.log('[liveExchangeService] Received ICE candidate:', JSON.stringify(data));
        callback(data);
      });
    } else {
      console.error('[liveExchangeService] Socket is not connected. Unable to listen for ICE candidates.');
      throw new Error('Socket connection error');
    }
  },

  /**
   * End a live session
   * @async
   * @param {string} sessionId - The ID of the session to end
   * @returns {Promise<Object>} The end session response data
   */
  endSession: async (sessionId) => {
    try {
      const response = await axiosInstance.post(`/${sessionId}/end`);
      console.log('Ended live session:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error ending live session:', error);
      throw error;
    }
  },

  /**
   * Toggle audio in a live session
   * @async
   * @param {string} sessionId - The ID of the session
   * @param {boolean} isAudioEnabled - Whether audio should be enabled or disabled
   * @returns {Promise<Object>} The toggle audio response data
   */
  toggleAudio: async (sessionId, isAudioEnabled) => {
    try {
      const response = await axiosInstance.post(`/${sessionId}/toggle-audio`, { isAudioEnabled });
      console.log('Toggled audio:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error toggling audio:', error);
      throw error;
    }
  },

  /**
   * Toggle video in a live session
   * @async
   * @param {string} sessionId - The ID of the session
   * @param {boolean} isVideoEnabled - Whether video should be enabled or disabled
   * @returns {Promise<Object>} The toggle video response data
   */
  toggleVideo: async (sessionId, isVideoEnabled) => {
    try {
      const response = await axiosInstance.post(`/${sessionId}/toggle-video`, { isVideoEnabled });
      console.log('Toggled video:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error toggling video:', error);
      throw error;
    }
  },

  /**
   * Start screen sharing in a live session
   * @async
   * @param {string} sessionId - The ID of the session
   * @param {string} userId - The ID of the user starting screen share
   * @returns {Promise<Object>} The screen share start response data
   */
  startScreenShare: async (sessionId, userId) => {
    try {
      await liveExchangeService.ensureSocketConnection();
      if (socket && socket.connected) {
        console.log(`[liveExchangeService] Emitting start_screen_share event: sessionId=${sessionId}, userId=${userId}`);
        return new Promise((resolve, reject) => {
          socket.emit('start_screen_share', { sessionId, userId }, (ack) => {
            if (ack && ack.error) {
              console.error('Screen share start error:', ack.error);
              reject(new Error(ack.error));
            } else {
              console.log('Screen share started successfully');
              resolve({ serverResponse: ack });
            }
          });
        });
      } else {
        throw new Error('Socket not connected');
      }
    } catch (error) {
      console.error('Error starting screen share:', error);
      throw error;
    }
  },

  /**
   * Stop screen sharing in a live session
   * @async
   * @param {string} sessionId - The ID of the session
   * @returns {Promise<Object>} The screen share stop response data
   */
  stopScreenShare: async (sessionId) => {
    try {
      const response = await axiosInstance.post(`/${sessionId}/stop-screen-share`);
      console.log('Stopped screen share:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error stopping screen share:', error);
      throw error;
    }
  },

  /**
   * Remove the listener for screen share start events
   */
  offScreenShareStarted: () => {
    if (socket && socket.connected) {
      socket.off('screen_share_started');
    }
  },
  
  /**
   * Remove the listener for screen share stop events
   */
  offScreenShareStopped: () => {
    if (socket && socket.connected) {
      socket.off('screen_share_stopped');
    }
  },

  /**
   * Set up a listener for participant joined events
   * @param {Function} callback - The callback function to handle participant joined events
   */
  onParticipantJoined: (callback) => {
    if (socket && socket.connected) {
      socket.on('participant_joined', (data) => {
        console.log('Participant joined:', data);
        callback(data);
      });
    } else {
      console.error('Socket is not connected. Unable to listen for participant joined event.');
    }
  },

  /**
   * Set up a listener for session state events
   * @param {Function} callback - The callback function to handle session state events
   */
  onSessionState: (callback) => {
    if (socket && socket.connected) {
      socket.on('session_state', (data) => {
        console.log('Received session state:', data);
        callback(data);
      });
    } else {
      console.error('Socket is not connected. Unable to listen for session state event.');
    }
  },

  /**
   * Set up a listener for session ended events
   * @param {Function} callback - The callback function to handle session ended events
   */
  onSessionEnded: (callback) => {
    if (socket && socket.connected) {
      socket.on('session_ended', callback);
    } else {
      console.error('Socket is not connected. Unable to listen for session ended event.');
    }
  },

  /**
   * Set up a listener for audio toggled events
   * @param {Function} callback - The callback function to handle audio toggled events
   */
  onAudioToggled: (callback) => {
    if (socket && socket.connected) {
      socket.on('audio_toggled', callback);
    } else {
      console.error('Socket is not connected. Unable to listen for audio toggled event.');
    }
  },

  /**
   * Set up a listener for video toggled events
   * @param {Function} callback - The callback function to handle video toggled events
   */
  onVideoToggled: (callback) => {
    if (socket && socket.connected) {
      socket.on('video_toggled', callback);
    } else {
      console.error('Socket is not connected. Unable to listen for video toggled event.');
    }
  },

  /**
   * Set up a listener for screen share started events
   * @param {Function} callback - The callback function to handle screen share started events
   */
  onScreenShareStarted: (callback) => {
    if (socket && socket.connected) {
      socket.on('screen_share_started', (data) => {
        console.log('Received screen share started event:', data);
        callback(data);
      });
    } else {
      console.error('Socket is not connected. Unable to listen for screen share started event.');
    }
  },

  /**
   * Set up a listener for screen share stopped events
   * @param {Function} callback - The callback function to handle screen share stopped events
   */
  onScreenShareStopped: (callback) => {
    if (socket && socket.connected) {
      socket.on('screen_share_stopped', (data) => {
        console.log('Received screen share stopped event:', data);
        callback(data);
      });
    }
  },

  /**
     * Verify a session token
     * @async
     * @param {string} sessionId - The ID of the session
     * @param {string} token - The token to verify
     * @returns {Promise<boolean>} Whether the token is valid
     */
  verifySessionToken: async (sessionId, token) => {
    try {
      const response = await axiosInstance.get(`/verify/${sessionId}/${token}`);
      console.log('Session token verified:', response.data);
      return response.data.isValid;
    } catch (error) {
      console.error('Error verifying session token:', error);
      throw error;
    }
  },

  /**
   * Send a live exchange invitation
   * @async
   * @param {string} exchangeId - The ID of the exchange
   * @param {string} receiverId - The ID of the invitation receiver
   * @returns {Promise<Object>} The invitation response data
   */
  sendLiveExchangeInvitation: async (exchangeId, receiverId) => {
    try {
      const response = await axiosInstance.post('/send-invitation', { exchangeId, receiverId });
      console.log('Sent live exchange invitation:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error sending live exchange invitation:', error);
      throw error;
    }
  },

  /**
   * Accept a live exchange invitation
   * @async
   * @param {string} invitationId - The ID of the invitation
   * @param {string} userId - The ID of the user accepting the invitation
   * @returns {Promise<Object>} The acceptance response data
   */
  acceptLiveExchangeInvitation: async (invitationId, userId) => {
    try {
      const response = await axiosInstance.post(`/accept-invitation/${invitationId}`);
      console.log('Accepted live exchange invitation:', response.data);
      if (socket && socket.connected) {
        socket.emit('join_live_session', { sessionId: response.data.id, isInitiator: false, userId: userId });
      }
      return response.data;
    } catch (error) {
      console.error('Error accepting live exchange invitation:', error);
      throw error;
    }
  },

  /**
   * Decline a live exchange invitation
   * @async
   * @param {string} invitationId - The ID of the invitation
   * @returns {Promise<Object>} The decline response data
   */
  declineLiveExchangeInvitation: async (invitationId) => {
    try {
      const response = await axiosInstance.post(`/decline-invitation/${invitationId}`);
      console.log('Declined live exchange invitation:', response.data);
      return response.data;
    } catch (error) {
      console.error('Error declining live exchange invitation:', error);
      throw error;
    }
  },

  /**
   * Set up a listener for live exchange invitation events
   * @param {Function} callback - The callback function to handle invitation events
   */
  onLiveExchangeInvitation: (callback) => {
    if (socket && socket.connected) {
      socket.on('live_exchange_invitation', (data) => {
        console.log('Received live exchange invitation:', data);
        callback(data);
      });
    } else {
      console.error('Socket is not connected. Unable to listen for live exchange invitation event.');
    }
  },

  /**
   * Set up a listener for invitation accepted events
   * @param {Function} callback - The callback function to handle invitation accepted events
   */
  onInvitationAccepted: (callback) => {
    if (socket && socket.connected) {
      socket.on('invitation_accepted', (data) => {
        console.log('Live exchange invitation accepted:', data);
        callback(data);
      });
    } else {
      console.error('Socket is not connected. Unable to listen for invitation accepted event.');
    }
  },

  /**
   * Emit a join room event
   * @param {string} sessionId - The ID of the session to join
   * @param {boolean} isInitiator - Whether the user is the initiator of the session
   * @param {string} userId - The ID of the user joining the room
   * @param {string} token - The authentication token
   */
  emitJoinRoom: (sessionId, isInitiator, userId, token) => {
    if (socket && socket.connected) {
      console.log(`Emitting join_live_session event: sessionId=${sessionId}, isInitiator=${isInitiator}, userId=${userId}`);
      socket.emit('join_live_session', { sessionId, isInitiator, userId, token });
    } else {
      console.error('Socket is not connected. Unable to join live session.');
    }
  },

  /**
   * Relay a signal
   * @async
   * @param {Object} params - The parameters for relaying the signal
   * @param {string} params.to - The recipient of the signal
   * @param {Object} params.signal - The signal data
   * @param {string} params.sessionId - The ID of the session
   * @returns {Promise<void>}
   */
  relaySignal: async ({ to, signal, sessionId }) => {
    try {
      await liveExchangeService.ensureSocketConnection();
      if (socket && socket.connected) {
        return new Promise((resolve, reject) => {
          socket.emit('signal', { to, signal, sessionId }, (ack) => {
            if (ack && ack.error) {
              console.error('Signal relay error:', ack.error);
              reject(new Error(ack.error));
            } else {
              resolve();
            }
          });
        });
      } else {
        throw new Error('Socket not connected');
      }
    } catch (error) {
      console.error('Error relaying signal:', error);
      throw error;
    }
  },

  /**
   * Set up a listener for received signals
   * @param {Function} callback - The callback function to handle received signals
   */
  onReceiveSignal: (callback) => {
    if (socket && socket.connected) {
      socket.on('signal', (data) => {
        callback(data);
      });
    } else {
      console.error('[liveExchangeService] Socket is not connected. Unable to listen for signals.');
      throw new Error('Socket connection error');
    }
  },

  /**
   * Check if the socket is connected
   * @returns {boolean} Whether the socket is connected
   */
  isSocketConnected: () => {
    return socket && socket.connected;
  },

  /**
   * Reconnect the socket
   * @async
   * @returns {Promise<SocketIOClient.Socket>} The reconnected socket
   */
  reconnectSocket: async () => {
    if (!socket || !socket.connected) {
      const token = localStorage.getItem('accessToken');
      try {
        await liveExchangeService.initSocket(token);
        console.log('[liveExchangeService] Socket reconnected successfully');
      } catch (error) {
        console.error('[liveExchangeService] Failed to reconnect socket:', error);
        throw error;
      }
    }
    return socket;
  },

  /**
   * Remove the listener for received signals
   * @param {Function} callback - The callback function to remove
   */
  offReceiveSignal: (callback) => {
    if (socket && socket.connected) {
      socket.off('signal', callback);
    }
  },

  /**
   * Set up a listener for user joined events
   * @param {Function} callback - The callback function to handle user joined events
   */
  onUserJoined: (callback) => {
    if (socket && socket.connected) {
      socket.on('user_joined_session', callback);
    } else {
      console.error('Socket is not connected. Unable to listen for user joined event.');
    }
  },

  /**
   * Remove the listener for user joined events
   */
  offUserJoined: () => {
    if (socket && socket.connected) {
      socket.off('user_joined_session');
    }
  },

  /**
   * Set up a listener for user left events
   * @param {Function} callback - The callback function to handle user left events
   */
  onUserLeft: (callback) => {
    if (socket && socket.connected) {
      socket.on('user_left', callback);
    }
  },

  /**
   * Remove the listener for user left events
   * @param {Function} callback - The callback function to remove
   */
  offUserLeft: (callback) => {
    if (socket && socket.connected) {
      socket.off('user_left', callback);
    }
  },

  /**
   * Handle peer errors
   * @param {Error} error - The error object
   * @param {string} sessionId - The ID of the session where the error occurred
   */
  handlePeerError: (error, sessionId) => {
    console.error('[liveExchangeService] Peer error:', error);
    if (socket && socket.connected) {
      socket.emit('peer_error', { sessionId, error: error.toString() });
    } else {
      console.error('[liveExchangeService] Socket is not connected. Unable to report peer error.');
    }
  },

  /**
   * Ensure socket connection
   * @async
   * @param {string} token - The authentication token
   * @returns {Promise<SocketIOClient.Socket>} The connected socket
   */
  ensureSocketConnection: async (token) => {
    if (!socket || !socket.connected) {
      console.log('[liveExchangeService] Socket not connected, attempting to reconnect');
      try {
        await liveExchangeService.initSocket(token);
      } catch (error) {
        console.error('[liveExchangeService] Failed to reconnect:', error);
        throw error;
      }
    }
    return socket;
  },

  /**
   * Check socket connection
   * @throws {Error} If socket is not connected
   */
  checkSocketConnection: () => {
    if (!socket || !socket.connected) {
      throw new Error('Socket not connected');
    }
  },

  /**
   * Emit a screen share signal
   * @param {Object} params - The parameters for emitting the screen share signal
   * @param {string} params.to - The recipient of the signal
   * @param {Object} params.signal - The signal data
   * @param {string} params.sessionId - The ID of the session
   * @param {boolean} params.isScreenSharing - Whether screen sharing is starting or stopping
   */
  emitScreenShareSignal: ({ to, signal, sessionId, isScreenSharing }) => {
    liveExchangeService.ensureSocketConnection().then(() => {
      console.log('Emitting screen share signal:', { to, signalType: signal.type, sessionId, isScreenSharing });
      socket.emit('screen_share_signal', { to, signal, sessionId, isScreenSharing }, (ack) => {
        if (ack && ack.error) {
          console.error('Error emitting screen share signal:', ack.error);
        } else {
          console.log('Screen share signal emitted successfully');
        }
      });
    }).catch(error => {
      console.error('Error ensuring socket connection:', error);
    });
  },

  /**
   * Emit a start screen share event
   * @param {Object} params - The parameters for starting screen share
   * @param {string} params.sessionId - The ID of the session
   * @param {string} params.userId - The ID of the user starting screen share
   */
  emitStartScreenShare: ({ sessionId, userId }) => {
    liveExchangeService.ensureSocketConnection().then(() => {
      console.log(`Emitting start_screen_share event: sessionId=${sessionId}, userId=${userId}`);
      socket.emit('start_screen_share', { sessionId, userId });
    }).catch(error => {
      console.error('Error ensuring socket connection:', error);
    });
  },

  /**
   * Emit a stop screen share event
   * @param {Object} params - The parameters for stopping screen share
   * @param {string} params.sessionId - The ID of the session
   * @param {string} params.userId - The ID of the user stopping screen share
   */
  emitStopScreenShare: ({ sessionId, userId }) => {
    liveExchangeService.ensureSocketConnection().then(() => {
      console.log(`Emitting stop_screen_share event: sessionId=${sessionId}, userId=${userId}`);
      socket.emit('stop_screen_share', { sessionId, userId });
    }).catch(error => {
      console.error('Error ensuring socket connection:', error);
    });
  },

  /**
   * Set up a listener for screen share signals
   * @param {Function} callback - The callback function to handle screen share signals
   */
  onScreenShareSignal: (callback) => {
    liveExchangeService.ensureSocketConnection().then(() => {
      socket.on('screen_share_signal', (data) => {
        console.log('Received screen share signal:', data);
        callback(data);
      });
    }).catch(error => {
      console.error('Error ensuring socket connection:', error);
    });
  },

  /**
   * Remove the listener for screen share signals
   * @param {Function} callback - The callback function to remove
   */
  offScreenShareSignal: (callback) => {
    if (socket && socket.connected) {
      socket.off('screen_share_signal', callback);
    }
  },

  /**
   * Send a message in the live session
   * @async
   * @param {Object} message - The message to send
   * @returns {Promise<void>}
   */
  sendMessage: async (message) => {
    console.log('liveExchangeService: Attempting to send message:', message);
    try {
      await liveExchangeService.ensureSocketConnection();
      if (socket && socket.connected) {
        console.log('liveExchangeService: Socket connected, emitting message');
        return new Promise((resolve, reject) => {
          socket.emit('send_live_session_message', message, (ack) => {
            if (ack && ack.error) {
              console.error('liveExchangeService: Error sending message:', ack.error);
              reject(new Error(ack.error));
            } else {
              console.log('liveExchangeService: Message sent successfully');
              resolve();
            }
          });
        });
      } else {
        throw new Error('Socket not connected');
      }
    } catch (error) {
      console.error('liveExchangeService: Error sending message:', error);
      throw error;
    }
  },

  /**
   * Set up a listener for received messages
   * @param {Function} callback - The callback function to handle received messages
   */
  onReceiveMessage: (callback) => {
    console.log('liveExchangeService: Setting up onReceiveMessage listener');
    if (socket && socket.connected) {
      socket.on('new_live_session_message', (message) => {
        console.log('liveExchangeService: Received new message:', message);
        callback(message);
      });
    } else {
      console.error('liveExchangeService: Socket is not connected. Unable to listen for messages.');
    }
  },

  /**
   * Remove the listener for received messages
   */
  offReceiveMessage: () => {
    console.log('liveExchangeService: Removing onReceiveMessage listener');
    if (socket && socket.connected) {
      socket.off('new_live_session_message');
    }
  },

  /**
     * Send a sync editor operation
     * @async
     * @param {string} sessionId - The ID of the session
     * @param {string} operation - The type of operation
     * @param {Object} data - The data associated with the operation
     * @returns {Promise<Object>} The acknowledgement from the server
     */
  sendSyncEditorOperation: async (sessionId, operation, data) => {
    try {
      await liveExchangeService.ensureSocketConnection();
      if (socket && socket.connected) {
        return new Promise((resolve, reject) => {
          socket.emit('sync_editor_operation', { sessionId, operation, data }, (ack) => {
            if (ack && ack.error) {
              console.error('Sync editor operation error:', ack.error);
              reject(new Error(ack.error));
            } else {
              console.log('Sync editor operation sent successfully');
              resolve(ack);
            }
          });
        });
      } else {
        throw new Error('Socket not connected');
      }
    } catch (error) {
      console.error('Error sending sync editor operation:', error);
      throw error;
    }
  },

  /**
   * Set up a listener for sync editor operations
   * @param {Function} callback - The callback function to handle sync editor operations
   */
  onSyncEditorOperation: (callback) => {
    if (socket && socket.connected) {
      socket.on('sync_editor_operation', (data) => {
        console.log('Received sync editor operation:', data);
        callback(data);
      });
    } else {
      console.error('Socket is not connected. Unable to listen for sync editor operations.');
    }
  },

  /**
   * Remove the listener for sync editor operations
   */
  offSyncEditorOperation: () => {
    if (socket && socket.connected) {
      socket.off('sync_editor_operation');
    }
  },

  /**
   * Send a chat message
   * @async
   * @param {string} sessionId - The ID of the session
   * @param {string} message - The message to send
   * @param {string} userId - The ID of the user sending the message
   * @returns {Promise<void>}
   */
  sendChatMessage: async (sessionId, message, userId) => {
    try {
      await liveExchangeService.ensureSocketConnection();
      if (socket && socket.connected) {
        return new Promise((resolve, reject) => {
          socket.emit('chat_message', { sessionId, message, userId }, (ack) => {
            if (ack && ack.error) {
              console.error('Error sending chat message:', ack.error);
              reject(new Error(ack.error));
            } else {
              console.log('Chat message sent successfully');
              resolve();
            }
          });
        });
      } else {
        throw new Error('Socket not connected');
      }
    } catch (error) {
      console.error('Error sending chat message:', error);
      throw error;
    }
  },

  /**
   * Set up a listener for chat messages
   * @param {Function} callback - The callback function to handle chat messages
   */
  onChatMessage: (callback) => {
    if (socket && socket.connected) {
      socket.on('chat_message', (data) => {
        console.log('Received chat message:', data);
        callback(data);
      });
    } else {
      console.error('Socket is not connected. Unable to listen for chat messages.');
    }
  },

  /**
   * Remove the listener for chat messages
   */
  offChatMessage: () => {
    if (socket && socket.connected) {
      socket.off('chat_message');
    }
  },

  /**
   * Remove all event listeners
   */
  removeEventListeners: () => {
    if (socket && socket.connected) {
      socket.off('participant_joined');
      socket.off('session_ended');
      socket.off('audio_toggled');
      socket.off('video_toggled');
      socket.off('screen_share_started');
      socket.off('screen_share_stopped');
      socket.off('live_exchange_invitation');
      socket.off('invitation_accepted');
      socket.off('user_joined');
      socket.off('user_left');
      socket.off('signal');
      socket.off('session_state');
    }
  }
  };

  export default liveExchangeService;