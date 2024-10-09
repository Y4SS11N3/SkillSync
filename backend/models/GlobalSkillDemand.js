const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class GlobalSkillDemand extends Model {}

GlobalSkillDemand.init({
  skillId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Skills',
      key: 'id'
    }
  },
  demandScore: {
    type: DataTypes.INTEGER,
    allowNull: false
  },
  region: {
    type: DataTypes.STRING,
    allowNull: false
  },
  lastUpdated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  }
}, {
  sequelize,
  modelName: 'GlobalSkillDemand',
  tableName: 'GlobalSkillDemands',
  timestamps: true
});

module.exports = GlobalSkillDemand;