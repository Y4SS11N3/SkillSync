// In models/TimeCredit.js
const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class TimeCredit extends Model {}

TimeCredit.init({
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  balance: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  }
}, {
  sequelize,
  modelName: 'TimeCredit',
  tableName: 'TimeCredits'
});

module.exports = TimeCredit;