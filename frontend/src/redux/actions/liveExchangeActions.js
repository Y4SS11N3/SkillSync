/**
 * @file liveExchangeActions.js
 * @description Redux actions for managing live exchange sessions, including WebRTC connections,
 * audio/video controls, screen sharing, and chat functionality.
 */

import liveExchangeService from '../../services/liveExchangeService';
import { loadUser } from './authActions';

// Action Types
export const INITIALIZE_SESSION = 'INITIALIZE_SESSION';
export const JOIN_SESSION = 'JOIN_SESSION';
export const END_SESSION = 'END_SESSION';
export const TOGGLE_AUDIO = 'TOGGLE_AUDIO';
export const TOGGLE_VIDEO = 'TOGGLE_VIDEO';
export const START_SCREEN_SHARE = 'START_SCREEN_SHARE';
export const STOP_SCREEN_SHARE = 'STOP_SCREEN_SHARE';
export const PARTICIPANT_JOINED = 'PARTICIPANT_JOINED';
export const SESSION_ENDED = 'SESSION_ENDED';
export const AUDIO_TOGGLED = 'AUDIO_TOGGLED';
export const VIDEO_TOGGLED = 'VIDEO_TOGGLED';
export const SCREEN_SHARE_STARTED = 'SCREEN_SHARE_STARTED';
export const SCREEN_SHARE_STOPPED = 'SCREEN_SHARE_STOPPED';
export const SET_ERROR = 'SET_ERROR';
export const SEND_LIVE_EXCHANGE_INVITATION = 'SEND_LIVE_EXCHANGE_INVITATION';
export const ACCEPT_LIVE_EXCHANGE_INVITATION = 'ACCEPT_LIVE_EXCHANGE_INVITATION';
export const DECLINE_LIVE_EXCHANGE_INVITATION = 'DECLINE_LIVE_EXCHANGE_INVITATION';
export const RECEIVE_LIVE_EXCHANGE_INVITATION = 'RECEIVE_LIVE_EXCHANGE_INVITATION';
export const PARTICIPANT_LEFT = 'PARTICIPANT_LEFT';
export const SESSION_STATE_UPDATED = 'SESSION_STATE_UPDATED';
export const INVITATION_ACCEPTED = 'INVITATION_ACCEPTED';
export const RECEIVE_SIGNAL = 'RECEIVE_SIGNAL';
export const UPDATE_WEBRTC_STATUS = 'UPDATE_WEBRTC_STATUS';
export const WEBRTC_CONNECTION_INITIALIZED = 'WEBRTC_CONNECTION_INITIALIZED';
export const LOCAL_STREAM_RECEIVED = 'LOCAL_STREAM_RECEIVED';
export const REMOTE_STREAM_RECEIVED = 'REMOTE_STREAM_RECEIVED';
export const UPDATE_CONNECTION_STATUS = 'UPDATE_CONNECTION_STATUS';
export const SYNC_EDITOR_OPERATION_SENT = 'SYNC_EDITOR_OPERATION_SENT';
export const SYNC_EDITOR_OPERATION_RECEIVED = 'SYNC_EDITOR_OPERATION_RECEIVED';
export const SEND_CHAT_MESSAGE = 'SEND_CHAT_MESSAGE';
export const RECEIVE_CHAT_MESSAGE = 'RECEIVE_CHAT_MESSAGE';
export const SET_SESSION_DETAILS = 'SET_SESSION_DETAILS';

/**
 * Logs messages with a prefix for easier debugging.
 * @param {string} message - The message to log.
 * @param {...any} args - Additional arguments to log.
 */
const log = (message, ...args) => {
  console.log(`[liveExchangeActions] ${message}`, ...args);
};

let socketInitialized = false;

/**
 * Initializes the WebSocket connection.
 * @returns {Promise<void>}
 */
const initializeSocket = async () => {
  if (socketInitialized) return;
  
  const token = localStorage.getItem('accessToken');
  try {
    await liveExchangeService.initSocket(token);
    socketInitialized = true;
  } catch (error) {
    console.error('Error initializing socket:', error);
    throw error;
  }
};

/**
 * Initializes a live exchange session.
 * @param {string} exchangeId - The ID of the exchange to initialize.
 * @returns {Function} Thunk function.
 */
export const initializeSession = (exchangeId) => async (dispatch, getState) => {
  const { liveExchange } = getState();
  if (liveExchange.session) {
    console.log('Session already initialized');
    return liveExchange.session;
  }

  try {
    console.log('Action: Initializing session for exchangeId:', exchangeId);
    await initializeSocket();
    const session = await liveExchangeService.initializeSession(exchangeId);
    
    console.log('Session initialized successfully:', session);
    
    if (!session || !session.id || !session.status) {
      console.error('Invalid session data received:', session);
      throw new Error('Invalid session data received from server');
    }
    
    dispatch({ type: INITIALIZE_SESSION, payload: { ...session, isInitiator: true } });
    dispatch(setupSignalListener());
    await dispatch(setupEventListeners());
    
    return session;
  } catch (error) {
    console.error('Error initializing session:', error.response?.data || error.message);
    dispatch({ type: SET_ERROR, payload: error.message });
    throw error;
  }
};

/**
 * Joins an existing live exchange session.
 * @param {string} sessionId - The ID of the session to join.
 * @param {string} token - Authentication token.
 * @returns {Function} Thunk function.
 */
export const joinSession = (sessionId, token) => async (dispatch, getState) => {
  const { liveExchange, auth } = getState();
  if (liveExchange.session && liveExchange.session.id === sessionId) {
    console.log('Already joined this session');
    return;
  }

  try {
    console.log(`Attempting to join session: ${sessionId}`);
    await initializeSocket();
    const actualToken = token || auth.token || localStorage.getItem('accessToken');
    if (!actualToken) {
      throw new Error('No authentication token available');
    }

    let userId = auth.user ? auth.user.id : null;
    if (!userId) {
      console.log('User data not found, attempting to load user');
      await dispatch(loadUser());
      const updatedAuth = getState().auth;
      userId = updatedAuth.user ? updatedAuth.user.id : null;
    }

    if (!userId) {
      throw new Error('User ID not available even after attempting to load user data');
    }

    const session = await liveExchangeService.joinSession(sessionId, actualToken, userId);
    
    if (!session || !session.id) {
      throw new Error('Invalid session data received from server');
    }

    console.log(`Successfully joined session: ${sessionId}`, session);
    dispatch({ type: JOIN_SESSION, payload: session });
    dispatch(setupSignalListener());
    await dispatch(setupEventListeners());

    dispatch(initializeWebRTCConnection(session));
  } catch (error) {
    console.error('Error joining session:', error);
    dispatch({ type: SET_ERROR, payload: error.message });
    throw error;
  }
};

/**
 * Fetches details for a specific session.
 * @param {string} sessionId - The ID of the session to fetch details for.
 * @returns {Function} Thunk function.
 */
export const fetchSessionDetails = (sessionId) => async (dispatch) => {
  try {
    const sessionDetails = await liveExchangeService.getSessionDetails(sessionId);
    dispatch({ type: SET_SESSION_DETAILS, payload: sessionDetails });
  } catch (error) {
    console.error('Error fetching session details:', error);
    dispatch({ type: SET_ERROR, payload: error.message });
  }
};

/**
 * Initializes WebRTC connection for a session.
 * @param {Object} session - The session object.
 * @returns {Function} Thunk function.
 */
export const initializeWebRTCConnection = (session) => async (dispatch, getState) => {
  try {
    const { userId } = getState().auth;
    const peerConnection = new RTCPeerConnection({
      iceServers: [{ urls: 'stun:stun.l.google.com:19302' }]
    });

    peerConnection.onicecandidate = (event) => {
      if (event.candidate) {
        dispatch(relaySignal({
          to: session.isInitiator ? session.providerId : session.initiatorId,
          signal: { type: 'ice-candidate', candidate: event.candidate },
          sessionId: session.id
        }));
      }
    };

    peerConnection.ontrack = (event) => {
      dispatch({
        type: 'REMOTE_STREAM_RECEIVED',
        payload: event.streams[0]
      });
    };

    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true });
    stream.getTracks().forEach(track => peerConnection.addTrack(track, stream));

    dispatch({
      type: 'LOCAL_STREAM_RECEIVED',
      payload: stream.id
    });

    if (session.isInitiator) {
      const offer = await peerConnection.createOffer();
      await peerConnection.setLocalDescription(offer);
      dispatch(relaySignal({
        to: session.providerId,
        signal: { type: 'offer', sdp: offer.sdp },
        sessionId: session.id
      }));
    }

    dispatch({
      type: 'WEBRTC_CONNECTION_INITIALIZED',
      payload: 'initialized'
    });

    return peerConnection;
  } catch (error) {
    console.error('Error initializing WebRTC connection:', error);
    dispatch({ type: SET_ERROR, payload: error.message });
    return null;
  }
};

/**
 * Ends a live exchange session.
 * @param {string} sessionId - The ID of the session to end.
 * @returns {Function} Thunk function.
 */
export const endSession = (sessionId) => async (dispatch, getState) => {
  try {
    await liveExchangeService.endSession(sessionId);
    dispatch({ type: END_SESSION });
    liveExchangeService.leaveLiveSession(sessionId);
    
    dispatch(cleanupEventListeners());
    dispatch(cleanupSyncEditorListener());
    dispatch(cleanupChatListener());
    
    const { localStream, remoteStream } = getState().liveExchange;
    if (localStream) {
      localStream.getTracks().forEach(track => track.stop());
    }
    if (remoteStream) {
      remoteStream.getTracks().forEach(track => track.stop());
    }
    
    const { peerConnection } = getState().liveExchange;
    if (peerConnection) {
      peerConnection.close();
    }
  } catch (error) {
    console.error('Error ending session:', error);
    dispatch({ type: SET_ERROR, payload: error.message });
  }
};

/**
 * Toggles audio for a session.
 * @param {string} sessionId - The ID of the session.
 * @param {boolean} isAudioEnabled - Whether audio should be enabled or disabled.
 * @returns {Function} Thunk function.
 */
export const toggleAudio = (sessionId, isAudioEnabled) => async (dispatch) => {
  try {
    await liveExchangeService.toggleAudio(sessionId, isAudioEnabled);
    dispatch({ type: TOGGLE_AUDIO, payload: isAudioEnabled });
  } catch (error) {
    console.error('Error toggling audio:', error);
    dispatch({ type: SET_ERROR, payload: error.message });
  }
};

/**
 * Toggles video for a session.
 * @param {string} sessionId - The ID of the session.
 * @param {boolean} isVideoEnabled - Whether video should be enabled or disabled.
 * @returns {Function} Thunk function.
 */
export const toggleVideo = (sessionId, isVideoEnabled) => async (dispatch) => {
  try {
    await liveExchangeService.toggleVideo(sessionId, isVideoEnabled);
    dispatch({ type: TOGGLE_VIDEO, payload: isVideoEnabled });
  } catch (error) {
    console.error('Error toggling video:', error);
    dispatch({ type: SET_ERROR, payload: error.message });
  }
};

/**
 * Starts screen sharing for a session.
 * @param {string} sessionId - The ID of the session.
 * @returns {Function} Thunk function.
 */
export const startScreenShare = (sessionId) => async (dispatch, getState) => {
  const { isScreenSharing } = getState().liveExchange;
  const uniqueId = Date.now();
  log(`[startScreenShare:${uniqueId}] Action called. Current isScreenSharing:`, isScreenSharing);
  
  if (!isScreenSharing) {
    log(`[startScreenShare:${uniqueId}] Dispatching START_SCREEN_SHARE action`);
    dispatch({ type: START_SCREEN_SHARE });
    try {
      await liveExchangeService.startScreenShare(sessionId);
      dispatch({ type: 'SET_LOCAL_SCREEN_SHARING', payload: true });
      log(`[startScreenShare:${uniqueId}] Screen share started successfully`);
    } catch (error) {
      console.error('Error starting screen share:', error);
      dispatch({ type: STOP_SCREEN_SHARE });
      dispatch({ type: SET_ERROR, payload: 'Failed to start screen sharing' });
    }
  } else {
    log(`[startScreenShare:${uniqueId}] Screen sharing is already active, no action taken`);
  }
};

/**
 * Stops screen sharing for a session.
 * @param {string} sessionId - The ID of the session.
 * @returns {Function} Thunk function.
 */
export const stopScreenShare = (sessionId) => async (dispatch) => {
  log('[stopScreenShare] Action called');
  dispatch({ type: STOP_SCREEN_SHARE });
  try {
    await liveExchangeService.stopScreenShare(sessionId);
    dispatch({ type: 'SET_LOCAL_SCREEN_SHARING', payload: false });
    log('[stopScreenShare] Screen share stopped successfully');
  } catch (error) {
    console.error('Error stopping screen share:', error);
    dispatch({ type: SET_ERROR, payload: 'Failed to stop screen sharing' });
  }
};

/**
 * Verifies a session token.
 * @param {string} sessionId - The ID of the session.
 * @param {string} token - The token to verify.
 * @returns {Function} Thunk function.
 */
export const verifySessionToken = (sessionId, token) => async (dispatch) => {
  try {
    const isValid = await liveExchangeService.verifySessionToken(sessionId, token);
    if (!isValid) {
      throw new Error('Invalid session token');
    }
    dispatch(joinSession(sessionId));
  } catch (error) {
    console.error('Error verifying session token:', error);
    dispatch({ type: SET_ERROR, payload: error.message });
  }
};

/**
 * Sends a live exchange invitation.
 * @param {string} exchangeId - The ID of the exchange.
 * @param {string} receiverId - The ID of the user receiving the invitation.
 * @returns {Function} Thunk function.
 */
export const sendLiveExchangeInvitation = (exchangeId, receiverId) => async (dispatch) => {
  try {
    const invitation = await liveExchangeService.sendLiveExchangeInvitation(exchangeId, receiverId);
    dispatch({ type: SEND_LIVE_EXCHANGE_INVITATION, payload: invitation });
    return invitation;
  } catch (error) {
    console.error('Error sending live exchange invitation:', error);
    dispatch({ type: SET_ERROR, payload: error.message });
  }
};

/**
 * Accepts a live exchange invitation.
 * @param {string} invitationId - The ID of the invitation to accept.
 * @returns {Function} Thunk function.
 */
export const acceptLiveExchangeInvitation = (invitationId) => async (dispatch) => {
  try {
    const session = await liveExchangeService.acceptLiveExchangeInvitation(invitationId);
    dispatch({ type: ACCEPT_LIVE_EXCHANGE_INVITATION, payload: { ...session, isInitiator: false } });
    dispatch(setupEventListeners());
    return session;
  } catch (error) {
    console.error('Error accepting live exchange invitation:', error);
    dispatch({ type: SET_ERROR, payload: error.message });
    throw error;
  }
};

/**
 * Declines a live exchange invitation.
 * @param {string} invitationId - The ID of the invitation to decline.
 * @returns {Function} Thunk function.
 */
export const declineLiveExchangeInvitation = (invitationId) => async (dispatch) => {
  try {
    const result = await liveExchangeService.declineLiveExchangeInvitation(invitationId);
    dispatch({ type: DECLINE_LIVE_EXCHANGE_INVITATION, payload: result });
    return result;
  } catch (error) {
    console.error('Error declining live exchange invitation:', error);
    dispatch({ type: SET_ERROR, payload: error.message });
  }
};

/**
 * Action creator for when a participant joins the session.
 * @param {Object} participant - The participant who joined.
 * @returns {Object} Action object.
 */
export const participantJoined = (participant) => ({
  type: PARTICIPANT_JOINED,
  payload: participant
});

/**
 * Action creator for when a participant leaves the session.
 * @param {string} userId - The ID of the user who left.
 * @returns {Object} Action object.
 */
export const participantLeft = (userId) => ({
  type: PARTICIPANT_LEFT,
  payload: { userId }
});

/**
 * Sets up event listeners for the live exchange session.
 * @returns {Function} Thunk function.
 */
export const setupEventListeners = () => async (dispatch, getState) => {
  const { liveExchange } = getState();
  if (liveExchange.listenersSetup) {
    console.log('Event listeners are already set up');
    return;
  }

  console.log('Setting up event listeners for live exchange');

  const eventHandlers = {
    participantJoined: (participant) => {
      console.log('Participant joined the session:', participant);
      dispatch(participantJoined(participant));
    },
    sessionState: (state) => {
      console.log('Received session state:', state);
      dispatch({ type: SESSION_STATE_UPDATED, payload: state });
    },
    invitationAccepted: (data) => {
      console.log('Live exchange invitation accepted:', data);
      dispatch({ type: INVITATION_ACCEPTED, payload: data });
    },
    userLeft: (data) => {
      console.log('Participant left the session:', data);
      if (data.userId) {
        dispatch(participantLeft(data.userId));
      } else {
        console.error('Invalid participant left data:', data);
      }
    },
    sessionEnded: (data) => {
      console.log('Session ended:', data);
      dispatch({ type: SESSION_ENDED, payload: data });
    },
    audioToggled: (data) => {
      console.log('Audio toggled:', data);
      dispatch({ type: AUDIO_TOGGLED, payload: data });
    },
    videoToggled: (data) => {
      console.log('Video toggled:', data);
      dispatch({ type: VIDEO_TOGGLED, payload: data });
    },
    screenShareStarted: (data) => {
      console.log('Screen share started:', data);
      dispatch({ type: SCREEN_SHARE_STARTED, payload: data });
    },
    screenShareStopped: (data) => {
      console.log('Screen share stopped:', data);
      dispatch({ type: SCREEN_SHARE_STOPPED, payload: data });
    },
    liveExchangeInvitation: (data) => {
      console.log('Live exchange invitation received:', data);
      dispatch({ type: RECEIVE_LIVE_EXCHANGE_INVITATION, payload: data });
    }
  };

  try {
    await Promise.all(Object.entries(eventHandlers).map(([event, handler]) => {
      const methodName = `on${event.charAt(0).toUpperCase() + event.slice(1)}`;
      if (typeof liveExchangeService[methodName] === 'function') {
        return liveExchangeService[methodName](handler);
      } else {
        console.warn(`Method ${methodName} not found in liveExchangeService`);
        return Promise.resolve();
      }
    }));

    dispatch({ type: 'SET_LISTENERS_SETUP', payload: true });
    console.log('Event listeners setup completed');
  } catch (error) {
    console.error('Error setting up event listeners:', error);
    dispatch({ type: SET_ERROR, payload: 'Failed to set up event listeners' });
    throw error;
  }
};

/**
 * Cleans up event listeners for the live exchange session.
 * @returns {Function} Thunk function.
 */
export const cleanupEventListeners = () => (dispatch) => {
  liveExchangeService.removeEventListeners();
  dispatch({ type: 'SET_LISTENERS_SETUP', payload: false });
};

/**
 * Emits a join room event.
 * @param {string} roomId - The ID of the room to join.
 * @param {string} userId - The ID of the user joining.
 * @returns {Function} Thunk function.
 */
export const emitJoinRoom = (roomId, userId) => async (dispatch) => {
  try {
    console.log(`Emitting join room: roomId=${roomId}, userId=${userId}`);
    await liveExchangeService.emitJoinRoom(roomId, userId);
  } catch (error) {
    console.error('Error emitting join room:', error);
    dispatch({ type: SET_ERROR, payload: error.message });
  }
};

/**
 * Relays a WebRTC signal.
 * @param {Object} options - The options for relaying the signal.
 * @param {string} options.to - The recipient of the signal.
 * @param {Object} options.signal - The signal data.
 * @param {string} options.sessionId - The ID of the session.
 * @returns {Function} Thunk function.
 */
export const relaySignal = ({ to, signal, sessionId }) => (dispatch, getState) => {
  const { session } = getState().liveExchange;
  if (session && session.id === sessionId) {
    console.log(`[liveExchangeActions] Emitting signal: to=${to}, signal type=${signal.type}, sessionId=${sessionId}`);
    liveExchangeService.relaySignal({ to, signal, sessionId });
  } else {
    console.error('[liveExchangeActions] No matching active session found when trying to emit signal');
    dispatch({ type: SET_ERROR, payload: 'No matching active session found' });
  }
};

/**
 * Sends a sync editor operation.
 * @param {string} sessionId - The ID of the session.
 * @param {string} operation - The type of operation.
 * @param {Object} data - The operation data.
 * @returns {Function} Thunk function.
 */
export const sendSyncEditorOperation = (sessionId, operation, data) => async (dispatch) => {
  try {
    await liveExchangeService.sendSyncEditorOperation(sessionId, operation, data);
    dispatch({ type: SYNC_EDITOR_OPERATION_SENT, payload: { operation, data } });
  } catch (error) {
    console.error('Error sending sync editor operation:', error);
    dispatch({ type: SET_ERROR, payload: error.message });
  }
};

/**
 * Sets up a listener for sync editor operations.
 * @returns {Function} Thunk function.
 */
export const setupSyncEditorListener = () => (dispatch) => {
  liveExchangeService.onSyncEditorOperation((data) => {
    console.log('Received sync editor operation:', data);
    dispatch({ type: SYNC_EDITOR_OPERATION_RECEIVED, payload: data });
  });
};

/**
 * Cleans up the sync editor operation listener.
 * @returns {Function} Thunk function.
 */
export const cleanupSyncEditorListener = () => (dispatch) => {
  liveExchangeService.offSyncEditorOperation();
};

/**
 * Sends a chat message.
 * @param {string} sessionId - The ID of the session.
 * @param {string} message - The message to send.
 * @returns {Function} Thunk function.
 */
export const sendChatMessage = (sessionId, message) => async (dispatch, getState) => {
  try {
    const { user } = getState().auth;
    await liveExchangeService.sendChatMessage(sessionId, message, user.id);
    dispatch({
      type: SEND_CHAT_MESSAGE,
      payload: { 
        sessionId, 
        message, 
        sender: user.id, 
        timestamp: new Date().toISOString() 
      }
    });
  } catch (error) {
    console.error('Error sending chat message:', error);
    dispatch({ type: SET_ERROR, payload: error.message });
  }
};

/**
 * Sets up a listener for chat messages.
 * @returns {Function} Thunk function.
 */
export const setupChatListener = () => (dispatch) => {
  liveExchangeService.onChatMessage((data) => {
    console.log('Received chat message in action:', data);
    dispatch({
      type: RECEIVE_CHAT_MESSAGE,
      payload: { 
        ...data, 
        timestamp: new Date(data.timestamp).toISOString() 
      }
    });
  });
};

/**
 * Cleans up the chat message listener.
 * @returns {Function} Thunk function.
 */
export const cleanupChatListener = () => (dispatch) => {
  liveExchangeService.offChatMessage();
};

/**
 * Sets up a listener for WebRTC signals.
 * @returns {Function} Thunk function.
 */
export const setupSignalListener = () => (dispatch) => {
  liveExchangeService.onReceiveSignal((data) => {
    console.log('Received WebRTC signal:', data);
    dispatch({ type: RECEIVE_SIGNAL, payload: data });
  });
};

/**
 * Handles a received WebRTC signal.
 * @param {Object} data - The received signal data.
 * @returns {Function} Thunk function.
 */
export const handleReceivedSignal = (data) => async (dispatch, getState) => {
  const { peerConnection } = getState().liveExchange;
  const { session } = getState().liveExchange;

  if (!peerConnection || !session) {
    console.error('No peer connection or session found');
    return;
  }

  try {
    log('Received WebRTC signal:', data.signal.type);
    if (data.signal.type === 'offer') {
      log('Processing offer');
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.signal));
      const answer = await peerConnection.createAnswer();
      await peerConnection.setLocalDescription(answer);
      dispatch(relaySignal({
        to: data.from,
        signal: { type: 'answer', sdp: answer.sdp },
        sessionId: session.id
      }));
      log('Answer sent');
    } else if (data.signal.type === 'answer') {
      log('Processing answer');
      await peerConnection.setRemoteDescription(new RTCSessionDescription(data.signal));
      log('Remote description set');
    } else if (data.signal.type === 'ice-candidate') {
      log('Processing ICE candidate');
      await peerConnection.addIceCandidate(new RTCIceCandidate(data.signal.candidate));
      log('ICE candidate added');
    }
  } catch (error) {
    console.error('Error handling received signal:', error);
    dispatch({ type: SET_ERROR, payload: error.message });
  }
};

/**
 * Updates the WebRTC status.
 * @param {string} status - The new WebRTC status.
 * @returns {Object} Action object.
 */
export const updateWebRTCStatus = (status) => ({
  type: UPDATE_WEBRTC_STATUS,
  payload: status
});

/**
 * Action creator for when the WebRTC connection is initialized.
 * @param {RTCPeerConnection} peerConnection - The initialized peer connection.
 * @returns {Object} Action object.
 */
export const webRTCConnectionInitialized = (peerConnection) => ({
  type: WEBRTC_CONNECTION_INITIALIZED,
  payload: peerConnection
});

/**
 * Action creator for when the local stream is received.
 * @param {MediaStream} stream - The local media stream.
 * @returns {Object} Action object.
 */
export const localStreamReceived = (stream) => ({
  type: LOCAL_STREAM_RECEIVED,
  payload: stream
});

/**
 * Action creator for when the remote stream is received.
 * @param {MediaStream} stream - The remote media stream.
 * @returns {Object} Action object.
 */
export const remoteStreamReceived = (stream) => ({
  type: REMOTE_STREAM_RECEIVED,
  payload: stream
});

/**
 * Updates the connection status.
 * @param {string} status - The new connection status.
 * @returns {Object} Action object.
 */
export const updateConnectionStatus = (status) => ({
  type: UPDATE_CONNECTION_STATUS,
  payload: status
});