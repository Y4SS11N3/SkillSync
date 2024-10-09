const exchangeService = require('../services/exchangeService');
const userService = require('../services/userService');
const notificationService = require('../services/notificationService');
const { User, Skill, Exchange, TimeCredit } = require('../models/associations');

/**
 * Controller handling exchange-related operations
 */
class ExchangeController {
  /**
   * Create a new exchange request
   * @param {number} user1Id - ID of the user initiating the exchange
   * @param {number} user2Id - ID of the user receiving the exchange request
   * @param {number} skill1Id - ID of the skill offered by user1
   * @param {number} skill2Id - ID of the skill requested from user2
   * @param {number} duration - Duration of the exchange in minutes
   * @param {Date} proposedTime - Proposed time for the exchange
   * @param {string} details - Additional details about the exchange
   * @returns {Promise<Exchange>} The created exchange
   */
  async createExchangeRequest(user1Id, user2Id, skill1Id, skill2Id, duration, proposedTime, details) {
    const [parsedUser1Id, parsedUser2Id, parsedSkill1Id, parsedSkill2Id, parsedDuration] = 
      [user1Id, user2Id, skill1Id, skill2Id, duration].map(val => parseInt(val, 10));

    if ([parsedUser1Id, parsedUser2Id, parsedSkill1Id, parsedSkill2Id, parsedDuration].some(isNaN)) {
      throw new Error('Invalid input: user IDs, skill IDs, and duration must be integers');
    }

    const [user1, user2, skill1, skill2] = await Promise.all([
      User.findByPk(parsedUser1Id),
      User.findByPk(parsedUser2Id),
      Skill.findByPk(parsedSkill1Id),
      Skill.findByPk(parsedSkill2Id)
    ]);

    if (!user1 || !user2 || !skill1 || !skill2) {
      throw new Error('Invalid user or skill');
    }

    let user1Credits = await TimeCredit.findOne({ where: { userId: parsedUser1Id } });
    if (!user1Credits) {
      user1Credits = await TimeCredit.create({ userId: parsedUser1Id, balance: 10 });
    }

    if (user1Credits.balance < parsedDuration) {
      throw new Error('Insufficient time credits');
    }

    const exchange = await Exchange.create({
      user1Id: parsedUser1Id,
      user2Id: parsedUser2Id,
      skill1Id: parsedSkill1Id,
      skill2Id: parsedSkill2Id,
      duration: parsedDuration,
      scheduledTime: proposedTime,
      details,
      status: 'pending'
    });

    const notificationContent = `${user1.name} wants to exchange their ${skill1.name} skill for your ${skill2.name} skill.`;
    await notificationService.createNotification(parsedUser2Id, 'New exchange request', notificationContent, exchange.id);

    return exchange;
  }

  /**
   * Get a specific exchange
   */
  async getExchange(req, res, next) {
    try {
      const { exchangeId } = req.params;
      const exchange = await exchangeService.getExchange(exchangeId);
      res.json(exchange);
    } catch (error) {
      next(error);
    }
  }

  /**
   * List exchanges for a user
   */
  async listExchanges(req, res, next) {
    try {
      const { status } = req.query;
      const userId = req.user.id;
      const exchanges = await exchangeService.listExchanges(userId, status);
      res.json(exchanges);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Respond to an exchange request
   */
  async respondToExchangeRequest(req, res, next) {
    try {
      const { exchangeId } = req.params;
      const { action } = req.body;
      const userId = req.user.id;

      if (!['accept', 'decline'].includes(action)) {
        return res.status(400).json({ message: 'Invalid action. Must be accept or decline.' });
      }

      const exchange = await exchangeService.respondToExchangeRequest(exchangeId, userId, action);
      res.json({ message: 'Exchange request updated successfully', exchange });
    } catch (error) {
      if (error.message === 'Unauthorized to respond to this exchange request' || error.message === 'Can only respond to pending exchange requests') {
        return res.status(403).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Complete an exchange
   */
  async completeExchange(req, res, next) {
    try {
      const { exchangeId } = req.params;
      const userId = req.user.id;
      const exchange = await exchangeService.completeExchange(exchangeId, userId);
      res.json({ message: 'Exchange completed successfully', exchange });
    } catch (error) {
      if (error.message === 'Unauthorized to complete this exchange' || error.message === 'Can only complete accepted exchanges') {
        return res.status(403).json({ message: error.message });
      }
      next(error);
    }
  }

  /**
   * Get exchange analytics for a user
   */
  async getExchangeAnalytics(req, res, next) {
    try {
      const userId = req.user.id;
      const analytics = await exchangeService.getExchangeAnalytics(userId);
      res.json(analytics);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Connect users for an exchange
   */
  async connectForExchange(req, res, next) {
    try {
      const { user2Id, skill1Id, skill2Id, duration, proposedTime, details } = req.body;
      const user1Id = req.user.id;

      if (!user2Id || !skill1Id || !skill2Id || !duration || !proposedTime) {
        return res.status(400).json({ message: 'Missing required fields' });
      }

      const user1Skills = await userService.getUserKnownSkills(user1Id);
      const user1HasSkill = user1Skills.some(skill => skill.skillId === parseInt(skill1Id, 10));
      
      if (!user1HasSkill) {
        return res.status(400).json({ message: 'You do not possess the skill you are trying to offer' });
      }

      const exchange = await exchangeService.createExchangeRequest(
        user1Id,
        user2Id,
        skill1Id,
        skill2Id,
        duration,
        proposedTime,
        details
      );

      res.status(201).json(exchange);
    } catch (error) {
      if (error.message === 'Insufficient time credits' || error.message.includes('Invalid input') || error.message === 'Users do not possess the required skills for this exchange') {
        return res.status(400).json({ message: error.message });
      }
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  }

  /**
   * Perform an advanced skill search
   */
  async advancedSkillSearch(req, res, next) {
    try {
      const userId = req.user.id;
      const { searchTerm: searchTermObj, category, level, timeCredit, page = 1 } = req.query;
      const searchTerm = searchTermObj.searchTerm;

      if (!searchTerm || typeof searchTerm !== 'string' || searchTerm.trim().length === 0) {
        return res.status(400).json({ message: 'Valid searchTerm is required' });
      }

      const results = await exchangeService.advancedSkillSearch(userId, searchTerm.trim(), { category, level, timeCredit, page });
      res.json(results);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Create a review for an exchange
   */
  async createReview(req, res, next) {
    try {
      const { exchangeId } = req.params;
      const { rating, comment } = req.body;
      const reviewerId = req.user.id;

      const review = await exchangeService.createReview(exchangeId, reviewerId, rating, comment);
      res.status(201).json(review);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get reviews for a user
   */
  async getReviewsForUser(req, res, next) {
    try {
      const { userId } = req.params;
      const reviews = await exchangeService.getReviewsForUser(userId);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Get reviews for an exchange
   */
  async getReviewsForExchange(req, res, next) {
    try {
      const { exchangeId } = req.params;
      const reviews = await exchangeService.getReviewsForExchange(exchangeId);
      res.json(reviews);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Update a review
   */
  async updateReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const { rating, comment } = req.body;
      const reviewerId = req.user.id;

      const updatedReview = await exchangeService.updateReview(reviewId, reviewerId, rating, comment);
      res.json(updatedReview);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Delete a review
   */
  async deleteReview(req, res, next) {
    try {
      const { reviewId } = req.params;
      const reviewerId = req.user.id;

      const result = await exchangeService.deleteReview(reviewId, reviewerId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }

  /**
   * Cancel an exchange
   */
  async cancelExchange(req, res, next) {
    try {
      const { exchangeId } = req.params;
      const userId = req.user.id;

      const result = await exchangeService.cancelExchange(exchangeId, userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  }
}

module.exports = new ExchangeController();