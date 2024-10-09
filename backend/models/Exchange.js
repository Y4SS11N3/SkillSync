const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Exchange extends Model {}

Exchange.init({
  user1Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  user2Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  skill1Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Skills',
      key: 'id'
    }
  },
  skill2Id: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Skills',
      key: 'id'
    }
  },
  duration: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  scheduledTime: {
    type: DataTypes.DATE,
    allowNull: false
  },
  status: {
    type: DataTypes.STRING,
    allowNull: false,
    defaultValue: 'pending',
    validate: {
      isIn: [['pending', 'accepted', 'declined', 'completed', 'cancelled']]
    }
  },
  user1Feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  user2Feedback: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  user1Avatar: {
    type: DataTypes.STRING,
    allowNull: true
  },
  user2Avatar: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Exchange',
  tableName: 'Exchanges'
});

module.exports = Exchange;