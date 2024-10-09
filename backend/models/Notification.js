const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Notification extends Model {
  static associate(models) {
    this.belongsTo(models.User, { foreignKey: 'userId' });
    this.belongsTo(models.Exchange, { foreignKey: 'exchangeId' });
  }
}

Notification.init({
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
    references: {
      model: 'Users',
      key: 'id'
    }
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false
  },
  content: {
    type: DataTypes.TEXT,
    allowNull: false
  },
  relatedId: {
    type: DataTypes.INTEGER,
    allowNull: true
  },
  exchangeId: {
    type: DataTypes.INTEGER,
    allowNull: true,
    references: {
      model: 'Exchanges',
      key: 'id'
    }
  },
  isRead: {
    type: DataTypes.BOOLEAN,
    defaultValue: false
  }
}, {
  sequelize,
  modelName: 'Notification',
  tableName: 'Notifications',
  timestamps: true
  // underscored: true
});

module.exports = Notification;