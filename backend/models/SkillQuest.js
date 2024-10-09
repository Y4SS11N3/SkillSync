const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class SkillQuest extends Model {}

SkillQuest.init({
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
  description: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  objectives: {
    type: DataTypes.TEXT,
    allowNull: false,
    get() {
      return JSON.parse(this.getDataValue('objectives'));
    },
    set(value) {
      this.setDataValue('objectives', JSON.stringify(value));
    }
  },
  reward: {
    type: DataTypes.JSON,
    allowNull: false
  },
  status: {
    type: DataTypes.ENUM('active', 'completed', 'expired'),
    allowNull: false,
    defaultValue: 'active'
  }
}, {
  sequelize,
  modelName: 'SkillQuest',
  tableName: 'SkillQuests'
});

module.exports = SkillQuest;