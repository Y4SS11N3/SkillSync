const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Reputation extends Model {
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userId' });
  }
}

Reputation.init({
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    unique: true,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  score: {
    type: DataTypes.FLOAT,
    allowNull: false,
    defaultValue: 0,
    validate: {
      min: 0,
      max: 5
    }
  },
  totalExchanges: {
    type: DataTypes.INTEGER,
    allowNull: false,
    defaultValue: 0
  },
  lastCalculated: {
    type: DataTypes.DATE,
    allowNull: false,
    defaultValue: DataTypes.NOW
  },
  blockchainHash: {
    type: DataTypes.STRING,
    allowNull: true
  }
}, {
  sequelize,
  modelName: 'Reputation',
  timestamps: true,
  underscored: true,
  indexes: [
    {
      unique: true,
      fields: ['user_id']
    },
    {
      fields: ['score']
    }
  ]
});

module.exports = Reputation;