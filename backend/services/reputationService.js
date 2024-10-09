/**
 * @file reputationService.js
 * @description Service for handling user reputation operations
 */

const { User, Review } = require('../models/associations');
const { Op } = require('sequelize');

/**
 * ReputationService class for managing user reputations
 */
class ReputationService {
  /**
   * Get a user's reputation and related statistics
   * @param {string} userId - The ID of the user
   * @returns {Promise<Object>} An object containing reputation statistics
   * @throws {Error} If the user is not found or there's an error calculating reputation
   */
  async getUserReputation(userId) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const reviews = await Review.findAll({ 
        where: { reviewedUserId: userId },
        order: [['createdAt', 'DESC']],
        attributes: ['id', 'rating', 'comment', 'createdAt']
      });

      const totalReviews = reviews.length;
      if (totalReviews === 0) {
        return {
          reputation: 0,
          totalReviews: 0,
          userRanking: 0,
          topPercentage: 0,
          recentReviews: []
        };
      }

      const reputation = reviews.reduce((sum, review) => sum + review.rating, 0) / totalReviews;
      const roundedReputation = parseFloat(reputation.toFixed(2));

      await user.update({ reputation: roundedReputation });

      const totalUsers = await User.count();
      const userRanking = await User.count({ where: { reputation: { [Op.gt]: roundedReputation } } }) + 1;
      const topPercentage = ((1 - (userRanking - 1) / totalUsers) * 100).toFixed(1);

      return {
        reputation: roundedReputation,
        totalReviews,
        userRanking,
        topPercentage,
        recentReviews: reviews.map(review => ({
          rating: review.rating,
          comment: review.comment,
          createdAt: review.createdAt
        }))
      };
    } catch (error) {
      console.error('Error in getUserReputation:', error);
      throw error;
    }
  }

  /**
   * Update a user's reputation based on a new rating
   * @param {string} userId - The ID of the user
   * @param {number} rating - The new rating to be added
   * @returns {Promise<number>} The updated reputation
   * @throws {Error} If the user is not found or there's an error updating reputation
   */
  async updateReputation(userId, rating) {
    try {
      const user = await User.findByPk(userId);
      if (!user) {
        throw new Error('User not found');
      }

      const reviews = await Review.findAll({ 
        where: { reviewedUserId: userId },
        attributes: ['rating']
      });

      reviews.push({ rating });

      const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
      const newReputation = totalRating / reviews.length;

      await user.update({ reputation: parseFloat(newReputation.toFixed(2)) });

      return newReputation;
    } catch (error) {
      console.error('Error in updateReputation:', error);
      throw error;
    }
  }
}

module.exports = new ReputationService();