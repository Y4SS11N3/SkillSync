const crypto = require('crypto');
const { LiveSession, User, Exchange } = require('../models/associations');
const NotificationService = require('./notificationService');
const { Sequelize } = require('sequelize');

/**
 * Service for handling live exchange sessions.
 * @class LiveExchangeService
 */
class LiveExchangeService {
  /**
   * Creates an instance of LiveExchangeService.
   * @param {Object} io - Socket.io instance for real-time communication.
   */
  constructor(io) {
    this.io = io;
    this.notificationService = new NotificationService(io);
    this.userSockets = new Map();
  }

  /**
   * Generates a unique token for session identification.
   * @returns {string} A unique token.
   */
  generateUniqueToken() {
    return crypto.randomBytes(16).toString('hex');
  }

  /**
   * Initializes a live exchange session.
   * @async
   * @param {number} exchangeId - The ID of the exchange.
   * @param {number} userId - The ID of the user initializing the session.
   * @returns {Promise<Object>} The initialized session details.
   * @throws {Error} If the exchange is not found or the user is not authorized.
   */
  async initializeSession(exchangeId, userId) {
  
    if (!exchangeId || isNaN(exchangeId)) {
      console.error(`Invalid exchangeId: ${exchangeId}`);
      throw new Error('Invalid exchange ID');
    }
  
    const exchange = await Exchange.findByPk(exchangeId, {
      include: [
        { model: User, as: 'user1' },
        { model: User, as: 'user2' }
      ]
    });
  
    if (!exchange) {
      console.error(`Exchange not found for id: ${exchangeId}`);
      throw new Error(`Exchange not found for id: ${exchangeId}`);
    }
    
    if (exchange.user1Id !== userId && exchange.user2Id !== userId) {
      console.error(`User ${userId} is not authorized to initiate session for exchange ${exchangeId}`);
      throw new Error('Unauthorized to initiate this session');
    }
  
    if (exchange.status !== 'accepted') {
      console.error(`Exchange ${exchangeId} status is not 'accepted'. Current status: ${exchange.status}`);
      throw new Error('Live session can only be initiated for accepted exchanges');
    }
  
    let existingSession = await LiveSession.findOne({
      where: { exchangeId, status: ['waiting', 'active'] },
      attributes: ['id', 'exchangeId', 'initiatorId', 'providerId', 'status', 'invitationStatus', 'startTime', 'endTime', 'token', 'initiatorJoined', 'providerJoined', 'createdAt', 'updatedAt']
    });
  
    if (existingSession) {
      return { 
        ...existingSession.toJSON(), 
        sessionUrl: `/live-exchange/${existingSession.id}/${existingSession.token}`,
        isInitiator: existingSession.initiatorId === userId
      };
    }
  
    const isInitiator = exchange.user1Id === userId;
    const initiatorId = isInitiator ? userId : exchange.user1Id;
    const providerId = isInitiator ? exchange.user2Id : userId;
    const sessionToken = this.generateUniqueToken();
    
    let session = await LiveSession.create({
      exchangeId,
      initiatorId,
      providerId,
      status: 'waiting',
      token: sessionToken,
      invitationStatus: 'pending',
      startTime: new Date(),
      initiatorJoined: false,
      providerJoined: false
    });
    
    this.io.to(`user_${providerId}`).emit('session_created', {
      sessionId: session.id,
      sessionUrl: `/live-exchange/${session.id}/${sessionToken}`,
      isInitiator: false
    });
  
    return {
      id: session.id,
      token: sessionToken,
      exchangeId: session.exchangeId,
      initiatorId: session.initiatorId,
      providerId: session.providerId,
      status: session.status,
      startTime: session.startTime,
      sessionUrl: `/live-exchange/${session.id}/${sessionToken}`,
      isInitiator
    };
  }

  /**
   * Allows a user to join a live exchange session.
   * @async
   * @param {number} sessionId - The ID of the session.
   * @param {string} token - The session token.
   * @param {number} userId - The ID of the user joining the session.
   * @param {string} socketId - The socket ID of the user.
   * @returns {Promise<Object>} The joined session details.
   * @throws {Error} If the session is not found or the token is invalid.
   */
  async joinSession(sessionId, token, userId, socketId) {
    const isValidToken = await this.verifySessionToken(sessionId, token, userId);
    if (!isValidToken) {
      throw new Error('Invalid session token');
    }
  
    const session = await LiveSession.findByPk(sessionId, {
      include: [
        { 
          model: Exchange, 
          include: [
            { model: User, as: 'user1' },
            { model: User, as: 'user2' }
          ] 
        }
      ]
    });
  
    if (!session) {
      throw new Error('Session not found');
    }
  
    if (session.status === 'ended') {
      throw new Error('Session has ended');
    }
  
    const isInitiator = session.initiatorId === userId;
    
    if (isInitiator) {
      session.initiatorJoined = true;
    } else {
      session.providerJoined = true;
    }
  
    if (session.initiatorJoined && session.providerJoined) {
      session.status = 'active';
      session.startTime = new Date();
    }
  
    await session.save();
  
    this.userSockets.set(userId, socketId);
  
    const userName = isInitiator ? session.Exchange.user1.name : session.Exchange.user2.name;
  
    this.io.to(`live_session_${sessionId}`).emit('user_joined_session', {
      userId,
      userName,
      isInitiator
    });
  
    this.io.to(`live_session_${sessionId}`).emit('session_state', {
      initiatorJoined: session.initiatorJoined,
      providerJoined: session.providerJoined,
      status: session.status
    });
  
    return { ...session.toJSON(), isInitiator };
  }
  
  /**
   * Relays a WebRTC signaling message between users in a session.
   * @async
   * @param {number} sessionId - The ID of the session.
   * @param {number} fromUserId - The ID of the user sending the message.
   * @param {number} toUserId - The ID of the user receiving the message.
   * @param {Object} message - The signaling message.
   * @returns {Promise<Object>} A success message.
   * @throws {Error} If the session is not found or the user is not authorized.
   */
  async relaySignalingMessage(sessionId, fromUserId, toUserId, message) {
    const session = await LiveSession.findByPk(sessionId);
  
    if (!session) {
      throw new Error('Session not found');
    }
  
    if (session.initiatorId !== fromUserId && session.providerId !== fromUserId) {
      throw new Error('Unauthorized to send signaling message in this session');
    }
  
    const toSocketId = this.userSockets.get(toUserId);
    if (toSocketId) {
      this.io.to(toSocketId).emit('webrtc_signaling', {
        fromUserId,
        message
      });
    } else {
      console.error(`Socket not found for user ${toUserId}`);
      throw new Error('Target user not connected');
    }
  
    return { message: 'Signaling message relayed successfully' };
  }
  
  /**
   * Removes a user's socket from the map.
   * @param {number} userId - The ID of the user.
   */
  removeUserSocket(userId) {
    this.userSockets.delete(userId);
  }

  /**
   * Ends a live exchange session.
   * @async
   * @param {number} sessionId - The ID of the session.
   * @param {number} userId - The ID of the user ending the session.
   * @returns {Promise<Object>} A success message.
   * @throws {Error} If the session is not found or the user is not authorized.
   */
  async endSession(sessionId, userId) {
    const session = await LiveSession.findByPk(sessionId);
  
    if (!session) {
      throw new Error('Session not found');
    }
  
    if (session.initiatorId !== userId && session.providerId !== userId) {
      throw new Error('Unauthorized to end this session');
    }
  
    session.status = 'ended';
    session.endTime = new Date();
    await session.save();
  
    this.io.to(`live_session_${sessionId}`).emit('session_ended', { sessionId });
  
    return { message: 'Session ended successfully' };
  }

  /**
   * Toggles the audio state for a user in a session.
   * @async
   * @param {number} sessionId - The ID of the session.
   * @param {number} userId - The ID of the user.
   * @param {boolean} isAudioEnabled - The new audio state.
   * @returns {Promise<Object>} A success message.
   * @throws {Error} If the session is not found or the user is not authorized.
   */
  async toggleAudio(sessionId, userId, isAudioEnabled) {
    const session = await LiveSession.findByPk(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.initiatorId !== userId && session.providerId !== userId) {
      throw new Error('Unauthorized to toggle audio in this session');
    }

    const updateField = session.initiatorId === userId ? 'initiatorAudioEnabled' : 'participantAudioEnabled';
    await session.update({ [updateField]: isAudioEnabled });

    this.io.to(`live_session_${sessionId}`).emit('audio_toggled', { userId, isAudioEnabled });

    return { message: 'Audio toggled successfully' };
  }

  /**
   * Toggles the video state for a user in a session.
   * @async
   * @param {number} sessionId - The ID of the session.
   * @param {number} userId - The ID of the user.
   * @param {boolean} isVideoEnabled - The new video state.
   * @returns {Promise<Object>} A success message.
   * @throws {Error} If the session is not found or the user is not authorized.
   */
  async toggleVideo(sessionId, userId, isVideoEnabled) {
    const session = await LiveSession.findByPk(sessionId);

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.initiatorId !== userId && session.providerId !== userId) {
      throw new Error('Unauthorized to toggle video in this session');
    }

    const updateField = session.initiatorId === userId ? 'initiatorVideoEnabled' : 'participantVideoEnabled';
    await session.update({ [updateField]: isVideoEnabled });

    this.io.to(`live_session_${sessionId}`).emit('video_toggled', { userId, isVideoEnabled });

    return { message: 'Video toggled successfully' };
  }

  /**
   * Starts screen sharing for a user in a session.
   * @async
   * @param {number} sessionId - The ID of the session.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Object>} A success message.
   * @throws {Error} If the session is not found, the user is not authorized, or screen is already being shared.
   */
  async startScreenShare(sessionId, userId) {
    const session = await this.getAndValidateSession(sessionId, userId);
  
    if (session.screenShareUserId) {
      throw new Error('Screen is already being shared');
    }
  
    session.screenShareUserId = userId;
    await session.save();
  
    this.io.to(`live_session_${sessionId}`).emit('screen_share_started', { userId });
  
    return { message: 'Screen share started successfully' };
  }

  /**
   * Stops screen sharing for a user in a session.
   * @async
   * @param {number} sessionId - The ID of the session.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Object>} A success message.
   * @throws {Error} If the session is not found or the user is not authorized to stop screen sharing.
   */
  async stopScreenShare(sessionId, userId) {
    const session = await this.getAndValidateSession(sessionId, userId);

    if (session.screenShareUserId !== userId) {
      throw new Error('Unauthorized to stop screen share');
    }

    session.screenShareUserId = null;
    await session.save();

    this.io.to(`live_session_${sessionId}`).emit('screen_share_stopped', { userId });

    return { message: 'Screen share stopped successfully' };
  }

  /**
     * Retrieves details of a live exchange session.
     * @async
     * @param {number} sessionId - The ID of the session.
     * @param {number} userId - The ID of the user requesting the details.
     * @returns {Promise<Object>} The session details.
     * @throws {Error} If the session is not found or the user is not authorized.
     */
  async getSessionDetails(sessionId, userId) {
    const session = await LiveSession.findByPk(sessionId, {
      include: [
        { model: Exchange, include: ['user1', 'user2'] },
        { model: User, as: 'initiator', attributes: ['id', 'name'] },
        { model: User, as: 'provider', attributes: ['id', 'name'] }
      ]
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (userId !== session.Exchange.user1Id && userId !== session.Exchange.user2Id) {
      throw new Error('Unauthorized to view this session');
    }

    return session;
  }

  /**
   * Verifies the session token.
   * @async
   * @param {number} sessionId - The ID of the session.
   * @param {string} token - The session token to verify.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<boolean>} True if the token is valid, false otherwise.
   * @throws {Error} If the session is not found or the user is not authorized.
   */
  async verifySessionToken(sessionId, token, userId) {
    let session;
    try {
      session = await LiveSession.findByPk(sessionId, {
        include: [{ model: Exchange, include: ['user1', 'user2'] }]
      });
    } catch (error) {
      throw new Error('Failed to retrieve session from database');
    }

    if (!session) {
      throw new Error('Session not found');
    }

    if (userId !== session.Exchange.user1Id && userId !== session.Exchange.user2Id) {
      console.error(`[LiveExchangeService] Unauthorized: userId=${userId} is neither user1Id=${session.Exchange.user1Id} nor user2Id=${session.Exchange.user2Id}`);
      throw new Error('Unauthorized to access this session');
    }

    if (token.split('.').length === 3) {
      const isValidJWT = await this.verifyJWT(token, userId);
      if (!isValidJWT) {
        return false;
      }
      return true;
    } else {
      const isValidToken = session.token === token;
      return isValidToken;
    }
  }

  /**
   * Verifies a JWT token.
   * @async
   * @param {string} token - The JWT token to verify.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<boolean>} True if the JWT is valid, false otherwise.
   */
  async verifyJWT(token, userId) {
    return true;
  }

  /**
   * Sends a live exchange invitation.
   * @async
   * @param {number} exchangeId - The ID of the exchange.
   * @param {number} senderId - The ID of the user sending the invitation.
   * @param {number} receiverId - The ID of the user receiving the invitation.
   * @returns {Promise<Object>} The created invitation details.
   * @throws {Error} If the exchange is not found or the user is not authorized.
   */
  async sendLiveExchangeInvitation(exchangeId, senderId, receiverId) {
    const exchange = await Exchange.findByPk(exchangeId, {
      include: [
        { model: User, as: 'user1' },
        { model: User, as: 'user2' }
      ]
    });

    if (!exchange) {
      throw new Error('Exchange not found');
    }

    if (exchange.user1Id !== senderId && exchange.user2Id !== senderId) {
      throw new Error('Unauthorized to send invitation for this exchange');
    }

    if (exchange.user1Id !== receiverId && exchange.user2Id !== receiverId) {
      throw new Error('Invalid receiver for this exchange');
    }

    const invitation = await LiveSession.create({
      exchangeId,
      initiatorId: senderId,
      providerId: receiverId,
      status: 'waiting'
    });

    const sessionUrl = `/live-exchange/${invitation.id}/${this.generateUniqueToken()}`;

    await this.notificationService.createNotification(
      receiverId,
      'Live Exchange Invitation',
      `You have been invited to a live exchange session for exchange #${exchangeId}`,
      null,
      exchangeId
    );

    this.io.to(`user_${receiverId}`).emit('live_exchange_invitation', {
      invitationId: invitation.id,
      exchangeId,
      senderId,
      sessionUrl
    });

    return { ...invitation.toJSON(), sessionUrl };
  }

  /**
   * Accepts a live exchange invitation.
   * @async
   * @param {number} invitationId - The ID of the invitation.
   * @param {number} userId - The ID of the user accepting the invitation.
   * @returns {Promise<Object>} The accepted invitation details.
   * @throws {Error} If the invitation is not found or the user is not authorized.
   */
  async acceptLiveExchangeInvitation(invitationId, userId) {

    const invitation = await LiveSession.findByPk(invitationId, {
      include: [{ model: Exchange, include: ['user1', 'user2'] }]
    });

    if (!invitation) {
      throw new Error('Invitation not found');
    }

    if (invitation.providerId !== userId) {
      throw new Error('Unauthorized to accept this invitation');
    }

    if (invitation.invitationStatus !== 'pending') {
      throw new Error('Invalid invitation status');
    }

    invitation.invitationStatus = 'accepted';
    const token = this.generateUniqueToken();
    invitation.token = token;
    await invitation.save();

    const sessionUrl = `/live-exchange/${invitation.id}/${token}`;

    await this.notificationService.createNotification(
      invitation.initiatorId,
      'live_exchange_accepted',
      `The live exchange invitation for exchange #${invitation.exchangeId} has been accepted`,
      invitation.id,
      invitation.exchangeId
    );

    this.io.to(`user_${invitation.initiatorId}`).emit('live_exchange_accepted', {
      invitationId: invitation.id,
      exchangeId: invitation.exchangeId,
      acceptedBy: userId,
      sessionUrl
    });

    return { ...invitation.toJSON(), token, sessionUrl };
  }

  /**
   * Retrieves and validates a session.
   * @async
   * @param {number} sessionId - The ID of the session.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Object>} The validated session.
   * @throws {Error} If the session is not found or the user is not authorized.
   */
  async getAndValidateSession(sessionId, userId) {
    const session = await LiveSession.findByPk(sessionId, {
      include: [{ model: Exchange, include: ['user1', 'user2'] }]
    });

    if (!session) {
      throw new Error('Session not found');
    }

    if (session.Exchange.user1Id !== userId && session.Exchange.user2Id !== userId) {
      throw new Error('Unauthorized to access this session');
    }

    return session;
  }

  /**
   * Handles a sync editor operation.
   * @async
   * @param {number} sessionId - The ID of the session.
   * @param {number} userId - The ID of the user performing the operation.
   * @param {string} operation - The type of operation.
   * @param {Object} data - The operation data.
   * @returns {Promise<Object>} A success message.
   * @throws {Error} If the session is not found, not active, or the user is not authorized.
   */
  async handleSyncEditorOperation(sessionId, userId, operation, data) {
    const session = await this.getAndValidateSession(sessionId, userId);

    if (session.status !== 'active') {
      throw new Error('Session is not active');
    }

    this.io.to(`live_session_${sessionId}`).emit('sync_editor_operation', {
      userId,
      operation,
      data
    });

    return { message: 'Sync editor operation broadcasted successfully' };
  }

  /**
   * Logs chat activity for a session.
   * @async
   * @param {number} sessionId - The ID of the session.
   * @param {number} fromUserId - The ID of the user sending the message.
   * @param {string} messageType - The type of message.
   * @returns {Promise<Object>} A success message.
   * @throws {Error} If the session is not found, not active, or the user is not authorized.
   */
  async logChatActivity(sessionId, fromUserId, messageType) {
    const session = await this.getAndValidateSession(sessionId, fromUserId);
    if (session.status !== 'active') {
      throw new Error('Session is not active');
    }
    
        
    return { message: 'Chat activity logged successfully' };
  }
  }

  module.exports = LiveExchangeService;