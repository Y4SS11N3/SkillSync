const { Model, DataTypes } = require('sequelize');
const sequelize = require('../database/connection');

class Review extends Model {
  static associate(models) {
    Review.belongsTo(models.Exchange, { foreignKey: 'exchangeId' });
    Review.belongsTo(models.User, { as: 'reviewer', foreignKey: 'reviewerId' });
    Review.belongsTo(models.User, { as: 'reviewedUser', foreignKey: 'reviewedUserId' });
    Review.belongsTo(models.Reputation, { foreignKey: 'reviewedUserId' });
  }
}

Review.init({
    rating: {
      type: DataTypes.FLOAT,
      allowNull: false,
      validate: {
        min: 0,
        max: 5
      }
    },
    comment: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    exchangeId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Exchanges',
        key: 'id'
      }
    },
    reviewerId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    },
    reviewedUserId: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'Users',
        key: 'id'
      }
    }
  }, {
    sequelize,
    modelName: 'Review',
    tableName: 'Reviews',
    timestamps: true,
    underscored: false
  });

module.exports = Review;