const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Chat extends Model {}

Chat.init({
  exchangeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Exchanges',
      key: 'id'
    }
  }
}, {
  sequelize,
  modelName: 'Chat',
  tableName: 'Chats'
});

module.exports = Chat;