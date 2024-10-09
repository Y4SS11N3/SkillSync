const ChatService = require('../services/chatService');
const { validationResult } = require('express-validator');

/**
 * Controller class for handling chat-related HTTP requests.
 */
class ChatController {
  /**
   * Creates an instance of ChatController.
   * @param {Object} io - Socket.io instance for real-time communication.
   */
  constructor(io) {
    this.chatService = new ChatService(io);
  }

  /**
   * Sends a message in a chat.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>}
   */
  async sendMessage(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { chatId, content } = req.body;
      const senderId = req.user.id;
  
      const decodedContent = this.decodeHTMLEntities(content);
  
      const message = await this.chatService.sendMessage(chatId, senderId, decodedContent);
  
      req.io.to(`chat_${chatId}`).emit('new_message', message);
  
      res.status(201).json(message);
    } catch (error) {
      this.handleError(res, error, 'Error in sendMessage');
    }
  }

  /**
   * Retrieves messages for a chat.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>}
   */
  async getMessages(req, res) {
    try {
      const { chatId } = req.params;
      const userId = req.user.id;

      const messages = await this.chatService.getMessages(chatId, userId);
      res.status(200).json(messages);
    } catch (error) {
      this.handleError(res, error, 'Error in getMessages');
    }
  }

  /**
   * Retrieves a chat by exchange ID.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>}
   */
  async getChatByExchange(req, res) {
    try {
      const { exchangeId } = req.params;
      const userId = req.user.id;

      const chat = await this.chatService.getChatByExchange(exchangeId, userId);
      res.status(200).json(chat);
    } catch (error) {
      this.handleError(res, error, 'Error in getChatByExchange');
    }
  }

  /**
   * Sends a live exchange invitation in a chat.
   * @param {Object} req - Express request object.
   * @param {Object} res - Express response object.
   * @returns {Promise<void>}
   */
  async sendLiveExchangeInvitation(req, res) {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
  
      const { chatId, exchangeId, sessionId } = req.body;
      const senderId = req.user.id;
  
      if (!chatId) {
        return res.status(400).json({ message: 'ChatId must be provided' });
      }

      const content = {
        type: 'LIVE_EXCHANGE_INVITATION',
        content: 'I would like to start a live exchange. Do you accept?',
        exchangeId,
        sessionId
      };

      const message = await this.chatService.sendMessage(chatId, senderId, JSON.stringify(content), 'LIVE_EXCHANGE_INVITATION');
  
      res.status(201).json(message);
    } catch (error) {
      this.handleError(res, error, 'Error in sendLiveExchangeInvitation');
    }
  }

  /**
   * Decodes HTML entities in the given text.
   * @private
   * @param {string} text - The text to decode.
   * @returns {string} The decoded text.
   */
  decodeHTMLEntities(text) {
    const entities = {
      '&amp;': '&',
      '&lt;': '<',
      '&gt;': '>',
      '&quot;': '"',
      '&#39;': "'",
      '&#x2F;': '/',
      '&#x60;': '`',
      '&#x3D;': '='
    };
    return text.replace(/&[#\w]+;/g, entity => entities[entity] || entity);
  }

  /**
   * Handles errors in controller methods.
   * @private
   * @param {Object} res - Express response object.
   * @param {Error} error - The error object.
   * @param {string} context - The context in which the error occurred.
   */
  handleError(res, error, context) {
    console.error(`[ChatController] ${context}:`, error);
    res.status(500).json({ message: error.message });
  }
}

module.exports = ChatController;