const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class UserSkill extends Model {}

UserSkill.init({
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  skillId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Skills',
      key: 'id'
    }
  },
  proficiencyLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  isInterested: {
    type: DataTypes.BOOLEAN,
    allowNull: false,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'UserSkill',
  tableName: 'UserSkills'
});

module.exports = UserSkill;