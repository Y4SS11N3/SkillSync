/**
 * @file reviewController.js
 * @description Controller for handling review-related operations
 */

const { Review, User, Exchange } = require('../models/associations');

/**
 * Create a new review for an exchange
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.createReview = async (req, res) => {
  try {
    const { exchangeId, rating, comment } = req.body;
    const reviewerId = req.user.id;

    const exchange = await Exchange.findByPk(exchangeId);
    if (!exchange) {
      return res.status(404).json({ message: 'Exchange not found' });
    }

    const reviewedUserId = exchange.user1Id === reviewerId ? exchange.user2Id : exchange.user1Id;

    const review = await Review.create({
      exchangeId,
      reviewerId,
      reviewedUserId,
      rating,
      comment
    });

    res.status(201).json(review);
  } catch (error) {
    console.error('Error creating review:', error);
    if (error.name === 'SequelizeValidationError') {
      res.status(400).json({ message: 'Invalid review data', errors: error.errors });
    } else {
      res.status(500).json({ message: 'Error creating review', error: error.message });
    }
  }
};

/**
 * Get all reviews for a specific user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getReviewsForUser = async (req, res) => {
  try {
    const userId = req.query.userId;

    const reviews = await Review.findAll({
      where: { reviewedUserId: userId },
      include: [
        { model: User, as: 'reviewer', attributes: ['id', 'name'] },
        { model: Exchange, attributes: ['id', 'scheduledTime'] }
      ]
    });

    res.json(reviews);
  } catch (error) {
    console.error('Error fetching reviews:', error);
    if (error.name === 'SequelizeDatabaseError') {
      res.status(400).json({ message: 'Invalid query parameters' });
    } else {
      res.status(500).json({ message: 'Error fetching reviews', error: error.message });
    }
  }
};