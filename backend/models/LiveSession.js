const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class LiveSession extends Model {}

LiveSession.init({
  exchangeId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Exchanges',
      key: 'id'
    }
  },
  initiatorId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  providerId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  status: {
    type: DataTypes.ENUM('waiting', 'active', 'ended'),
    allowNull: false,
    defaultValue: 'waiting'
  },
  invitationStatus: {
    type: DataTypes.ENUM('pending', 'accepted', 'declined'),
    allowNull: false,
    defaultValue: 'pending'
  },
  startTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  endTime: {
    type: DataTypes.DATE,
    allowNull: true
  },
  token: {
    type: DataTypes.STRING,
    allowNull: true
  },
  initiatorJoined: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
  providerJoined: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  },
}, {
  sequelize,
  modelName: 'LiveSession',
  tableName: 'LiveSessions'
});

module.exports = LiveSession;