const LiveExchangeService = require('../services/liveExchangeService');
const { validationResult } = require('express-validator');

/**
 * Controller for handling live exchange operations.
 * @class LiveExchangeController
 */
class LiveExchangeController {
  /**
   * Creates an instance of LiveExchangeController.
   * @param {Object} io - Socket.io instance for real-time communication.
   */
  constructor(io) {
    this.liveExchangeService = new LiveExchangeService(io);
  }

  /**
   * Initializes a live exchange session.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async initializeSession(req, res) {
    try {
      const { exchangeId } = req.body;
      const userId = req.user.id;
      const session = await this.liveExchangeService.initializeSession(exchangeId, userId);
      res.status(201).json(session);
    } catch (error) {
      console.error('Error in initializeSession:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Joins a live exchange session.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async joinSession(req, res) {
    try {
      const { sessionId } = req.params;
      const { token } = req.body;
      const userId = req.user.id;
      const socketId = req.socketId || 'http-request';
  
      if (!userId) {
        console.error('[LiveExchangeController] User ID is missing');
        return res.status(400).json({ error: 'User ID is missing' });
      }
    
      if (!token) {
        console.error('[LiveExchangeController] Token is missing');
        return res.status(400).json({ error: 'Token is required' });
      }
  
      const session = await this.liveExchangeService.joinSession(sessionId, token, userId, socketId);
      res.json(session);
    } catch (error) {
      console.error('[LiveExchangeController] Error joining session:', error);
      res.status(500).json({ error: 'Failed to join session', details: error.message });
    }
  }

  /**
   * Ends a live exchange session.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async endSession(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const result = await this.liveExchangeService.endSession(sessionId, userId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in endSession:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Toggles audio in a live exchange session.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async toggleAudio(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const { isAudioEnabled } = req.body;
      const result = await this.liveExchangeService.toggleAudio(sessionId, userId, isAudioEnabled);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in toggleAudio:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Toggles video in a live exchange session.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async toggleVideo(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const { isVideoEnabled } = req.body;
      const result = await this.liveExchangeService.toggleVideo(sessionId, userId, isVideoEnabled);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in toggleVideo:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Starts screen sharing in a live exchange session.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async startScreenShare(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const result = await this.liveExchangeService.startScreenShare(sessionId, userId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in startScreenShare:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Stops screen sharing in a live exchange session.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async stopScreenShare(req, res) {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const result = await this.liveExchangeService.stopScreenShare(sessionId, userId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in stopScreenShare:', error);
      res.status(error.status || 500).json({ message: error.message });
    }
  }

  /**
   * Gets details of a live exchange session.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async getSessionDetails(req, res) {
    try {
      const { sessionId } = req.params;
      const userId = req.user.id;
      const session = await this.liveExchangeService.getSessionDetails(sessionId, userId);
      res.status(200).json(session);
    } catch (error) {
      console.error('Error in getSessionDetails:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Verifies a session token.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async verifySessionToken(req, res) {
    try {
      const { sessionId, token } = req.params;
      const userId = req.user.id;
      const isValid = await this.liveExchangeService.verifySessionToken(sessionId, token, userId);
      res.status(200).json({ isValid });
    } catch (error) {
      console.error('Error in verifySessionToken:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Sends a live exchange invitation.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async sendLiveExchangeInvitation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const { exchangeId, receiverId } = req.body;
      const senderId = req.user.id;
      const invitation = await this.liveExchangeService.sendLiveExchangeInvitation(exchangeId, senderId, receiverId);
      res.status(201).json(invitation);
    } catch (error) {
      console.error('Error in sendLiveExchangeInvitation:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Accepts a live exchange invitation.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async acceptLiveExchangeInvitation(req, res) {
    try {
      const { invitationId } = req.params;
      const userId = req.user.id;
      const session = await this.liveExchangeService.acceptLiveExchangeInvitation(invitationId, userId);
      res.status(200).json(session);
    } catch (error) {
      console.error('Error in acceptLiveExchangeInvitation:', error);
      res.status(error.message.includes('Unauthorized') ? 403 : 500).json({ message: error.message });
    }
  }

  /**
   * Declines a live exchange invitation.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async declineLiveExchangeInvitation(req, res) {
    try {
      const { invitationId } = req.params;
      const userId = req.user.id;
      const result = await this.liveExchangeService.declineLiveExchangeInvitation(invitationId, userId);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in declineLiveExchangeInvitation:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Handles a sync editor operation.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async handleSyncEditorOperation(req, res) {
    try {
      const { sessionId } = req.params;
      const { operation, data } = req.body;
      const userId = req.user.id;

      const result = await this.liveExchangeService.handleSyncEditorOperation(sessionId, userId, operation, data);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in handleSyncEditorOperation:', error);
      res.status(500).json({ message: error.message });
    }
  }

  /**
   * Logs chat activity in a live exchange session.
   * @async
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   */
  async logChatActivity(req, res) {
    try {
      const { sessionId } = req.params;
      const { messageType } = req.body;
      const userId = req.user.id;
  
      const result = await this.liveExchangeService.logChatActivity(sessionId, userId, messageType);
      res.status(200).json(result);
    } catch (error) {
      console.error('Error in logChatActivity:', error);
      res.status(500).json({ message: error.message });
    }
  }
}

module.exports = LiveExchangeController;