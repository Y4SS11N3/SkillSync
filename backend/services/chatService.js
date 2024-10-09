const { Chat, Message, User, Exchange } = require('../models/associations');
const { Op } = require('sequelize');
const NotificationService = require('./notificationService');

/**
 * Service class for handling chat-related operations.
 */
class ChatService {
  /**
   * Creates an instance of ChatService.
   * @param {Object} io - Socket.io instance for real-time communication.
   */
  constructor(io) {
    this.io = io;
    this.notificationService = new NotificationService(io);
  }

  /**
   * Creates a new chat for an accepted exchange.
   * @param {number} exchangeId - The ID of the exchange.
   * @returns {Promise<Chat>} The created chat object.
   * @throws {Error} If the exchange is not found or not accepted.
   */
  async createChat(exchangeId) {
    const exchange = await Exchange.findByPk(exchangeId);
    if (!exchange) {
      throw new Error('Exchange not found');
    }
    if (exchange.status !== 'accepted') {
      throw new Error('Chat can only be created for accepted exchanges');
    }
    
    const chat = await Chat.create({ exchangeId });
    return chat;
  }

  /**
   * Sends a message in a chat.
   * @param {number} chatId - The ID of the chat.
   * @param {number} senderId - The ID of the message sender.
   * @param {string} content - The content of the message.
   * @returns {Promise<Message>} The created message object.
   * @throws {Error} If the chat or exchange is invalid, or if the sender is unauthorized.
   */
  async sendMessage(chatId, senderId, content) {
    let messageType = 'text';
    let processedContent = content;
  
    try {
      const parsedContent = JSON.parse(content);
      if (typeof parsedContent === 'object') {
        messageType = parsedContent.type || 'text';
        processedContent = JSON.stringify(parsedContent);
      }
    } catch (error) {
      console.error('[ChatService] Error parsing content:', error);
    }
  
    let chat = await this.getChatWithExchange(chatId, senderId);
  
    if (chat.Exchange.status !== 'accepted') {
      console.error(`[ChatService] Exchange status is not 'accepted'. Status: ${chat.Exchange.status}`);
      throw new Error('Cannot send messages for non-accepted exchanges');
    }
  
    if (senderId !== chat.Exchange.user1Id && senderId !== chat.Exchange.user2Id) {
      console.error(`[ChatService] Unauthorized sender. SenderId: ${senderId}, User1Id: ${chat.Exchange.user1Id}, User2Id: ${chat.Exchange.user2Id}`);
      throw new Error('Unauthorized to send messages in this chat');
    }
  
    const message = await Message.create({
      chatId: chat.id,
      senderId,
      content: processedContent,
      type: messageType
    });
  
    const populatedMessage = await this.getPopulatedMessage(message.id);
  
    this.io.to(`chat_${chat.id}`).emit('new_message', populatedMessage.toJSON());
  
    await this.createMessageNotification(chat, senderId, processedContent);
  
    return populatedMessage;
  }

  /**
   * Retrieves messages for a chat.
   * @param {number} chatId - The ID of the chat.
   * @param {number} userId - The ID of the user requesting messages.
   * @returns {Promise<Message[]>} An array of message objects.
   * @throws {Error} If the chat is not found or the user is unauthorized.
   */
  async getMessages(chatId, userId) {
    const chat = await this.getChatWithExchange(chatId, userId);

    if (userId !== chat.Exchange.user1Id && userId !== chat.Exchange.user2Id) {
      throw new Error('Unauthorized to view this chat');
    }

    if (chat.Exchange.status !== 'accepted') {
      throw new Error('Cannot view messages for non-accepted exchanges');
    }

    const messages = await Message.findAll({
      where: { chatId: chat.id },
      order: [['createdAt', 'ASC']],
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name']
        }
      ]
    });

    return messages;
  }

  /**
   * Retrieves a chat by exchange ID.
   * @param {number} exchangeId - The ID of the exchange.
   * @param {number} userId - The ID of the user requesting the chat.
   * @returns {Promise<Chat>} The chat object.
   * @throws {Error} If the exchange is not found, the user is unauthorized, or the exchange is not accepted.
   */
  async getChatByExchange(exchangeId, userId) {
    const exchange = await Exchange.findByPk(exchangeId);
    if (!exchange) {
      throw new Error('Exchange not found');
    }
  
    if (userId !== exchange.user1Id && userId !== exchange.user2Id) {
      throw new Error('Unauthorized to access this chat');
    }
  
    if (exchange.status !== 'accepted') {
      throw new Error('Chat is only available for accepted exchanges');
    }
  
    let chat = await Chat.findOne({ where: { exchangeId } });
    if (!chat) {
      chat = await Chat.create({ exchangeId });
    }
  
    return chat;
  }

  /**
   * Sends a live exchange invitation in a chat.
   * @param {number} chatId - The ID of the chat.
   * @param {number} senderId - The ID of the invitation sender.
   * @param {Object} content - The content of the invitation.
   * @returns {Promise<Message>} The created message object.
   * @throws {Error} If the chat is not found or the sender is unauthorized.
   */
  async sendLiveExchangeInvitation(chatId, senderId, content) {
    const chat = await this.getChatWithExchange(chatId, senderId);
  
    if (senderId !== chat.Exchange.user1Id && senderId !== chat.Exchange.user2Id) {
      throw new Error('Unauthorized to send messages in this chat');
    }
  
    const message = await Message.create({
      chatId,
      senderId,
      content: JSON.stringify(content),
      type: 'LIVE_EXCHANGE_INVITATION'
    });
  
    const populatedMessage = await this.getPopulatedMessage(message.id);
  
    this.io.to(`chat_${chatId}`).emit('new_message', populatedMessage);
  
    const recipientId = senderId === chat.Exchange.user1Id ? chat.Exchange.user2Id : chat.Exchange.user1Id;
    const senderName = senderId === chat.Exchange.user1Id ? chat.Exchange.user1.name : chat.Exchange.user2.name;
  
    await this.notificationService.createNotification(
      recipientId,
      'Live Exchange Invitation',
      `${senderName} has invited you to a live exchange session`,
      chatId,
      chat.Exchange.id
    );
  
    return populatedMessage;
  }

  /**
   * Retrieves a chat with its associated exchange.
   * @private
   * @param {number} chatId - The ID of the chat.
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Chat>} The chat object with associated exchange.
   * @throws {Error} If no valid chat or exchange is found.
   */
  async getChatWithExchange(chatId, userId) {
    let chat = await Chat.findByPk(chatId, {
      include: [{ model: Exchange, include: [{ model: User, as: 'user1' }, { model: User, as: 'user2' }] }]
    });
  
    if (!chat) {
      const exchange = await Exchange.findOne({
        where: {
          [Op.or]: [
            { user1Id: userId },
            { user2Id: userId }
          ],
          status: 'accepted'
        },
        include: [{ model: User, as: 'user1' }, { model: User, as: 'user2' }]
      });
  
      if (!exchange) {
        console.error('[ChatService] No valid exchange found');
        throw new Error('No valid exchange found for this chat');
      }
  
      chat = await Chat.create({ exchangeId: exchange.id });
      chat.Exchange = exchange;
    }

    return chat;
  }

  /**
   * Retrieves a populated message by its ID.
   * @private
   * @param {number} messageId - The ID of the message.
   * @returns {Promise<Message>} The populated message object.
   */
  async getPopulatedMessage(messageId) {
    return Message.findByPk(messageId, {
      include: [
        {
          model: User,
          as: 'sender',
          attributes: ['id', 'name']
        }
      ]
    });
  }

  /**
   * Creates a notification for a new message.
   * @private
   * @param {Chat} chat - The chat object.
   * @param {number} senderId - The ID of the message sender.
   * @param {string} content - The content of the message.
   */
  async createMessageNotification(chat, senderId, content) {
    const recipientId = senderId === chat.Exchange.user1Id ? chat.Exchange.user2Id : chat.Exchange.user1Id;
    const senderName = senderId === chat.Exchange.user1Id ? chat.Exchange.user1.name : chat.Exchange.user2.name;
    
    let notificationContent;
    try {
      const parsedContent = JSON.parse(content);
      if (typeof parsedContent === 'object' && parsedContent.content) {
        notificationContent = parsedContent.content;
      } else {
        notificationContent = content;
      }
    } catch (error) {
      console.error('[ChatService] Error parsing notification content:', error);
      notificationContent = content;
    }
  
    try {
      await this.notificationService.createNotification(
        recipientId,
        'New chat message',
        `${senderName} sent you a message: ${notificationContent.substring(0, 50)}${notificationContent.length > 50 ? '...' : ''}`,
        chat.id,
        chat.Exchange.id
      );
    } catch (error) {
      console.error('[ChatService] Error creating notification:', error);
    }
  }
}

module.exports = ChatService;