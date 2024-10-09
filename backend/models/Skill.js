const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Skill extends Model {}

Skill.init({
  name: {
    type: DataTypes.STRING,
    allowNull: false
  },
  description: {
    type: DataTypes.TEXT,
    allowNull: true
  },
  proficiencyLevel: {
    type: DataTypes.INTEGER,
    allowNull: false,
    validate: {
      min: 1,
      max: 5
    }
  },
  category: {
    type: DataTypes.ENUM,
    values: [
      'Languages',
      'Programming',
      'Design',
      'Marketing',
      'Data Science',
      'Business',
      'Finance',
      'Education',
      'Healthcare',
      'Engineering',
      'Writing',
      'Music',
      'Art',
      'Other'
    ],
    allowNull: false,
    defaultValue: 'Other'
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Users',
      key: 'id'
    },
  }
}, {
  sequelize,
  modelName: 'Skill',
  tableName: 'Skills'
});

module.exports = Skill;