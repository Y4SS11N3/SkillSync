const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Achievement extends Model {}

Achievement.init({
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  achievedAt: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'Achievement',
  tableName: 'Achievements'
});

module.exports = Achievement;