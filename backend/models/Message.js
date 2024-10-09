const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Message extends Model {
  static async createWithValidation(messageData) {
    
    if (typeof messageData.content === 'object') {
      messageData.content = JSON.stringify(messageData.content);
    }

    if (!['text', 'LIVE_EXCHANGE_INVITATION', 'LIVE_EXCHANGE_ACCEPTED'].includes(messageData.type)) {
      console.error('[Message Model] Invalid message type:', messageData.type);
      throw new Error('Invalid message type');
    }

    if (['LIVE_EXCHANGE_INVITATION', 'LIVE_EXCHANGE_ACCEPTED'].includes(messageData.type)) {
      if (!messageData.liveSessionId) {
        console.error('[Message Model] liveSessionId is required for type:', messageData.type);
        throw new Error('liveSessionId is required for this message type');
      }
    }

    const message = await this.create(messageData);
    return message;
  }

  static async findByPkWithSender(id) {
    const message = await this.findByPk(id, {
      include: [
        {
          model: sequelize.models.User,
          as: 'sender',
          attributes: ['id', 'name']
        }
      ]
    });
    return message;
  }
}

Message.init({
  chatId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Chats',
      key: 'id'
    }
  },
  senderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      const rawValue = this.getDataValue('content');
      if (rawValue) {
        try {
          return JSON.parse(rawValue);
        } catch (error) {
          return rawValue;
        }
      }
      return null;
    },
    set(value) {
      this.setDataValue('content', typeof value === 'object' ? JSON.stringify(value) : value);
    }
  },
  type: {
    type: DataTypes.ENUM('text', 'LIVE_EXCHANGE_INVITATION', 'LIVE_EXCHANGE_ACCEPTED'),
    allowNull: false,
    defaultValue: 'text'
  },
  liveSessionId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'LiveSessions',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Message',
  tableName: 'Messages',
  hooks: {
    beforeCreate: (message, options) => {
    },
    afterCreate: (message, options) => {
    }
  }
});

module.exports = Message;