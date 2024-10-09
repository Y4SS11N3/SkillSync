const { Exchange, User, Skill, TimeCredit, UserSkill, Review } = require('../models/associations');
const blockchainService = require('./blockchainService');
const reputationService = require('./reputationService');
const NotificationService = require('./notificationService');
const { Op } = require('sequelize');

/**
 * Generate a default avatar URL for a user
 * @param {string} name - The name of the user
 * @returns {string} The URL of the default avatar
 */
const getDefaultAvatarUrl = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
};

/**
 * Service class for handling exchange-related operations
 */
class ExchangeService {
  /**
   * Create an ExchangeService instance
   * @param {object} io - Socket.io instance for real-time notifications
   */
  constructor(io) {
    this.notificationService = new NotificationService(io);
  }

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
   * @throws {Error} If input is invalid or users don't have required skills
   */
  async createExchangeRequest(user1Id, user2Id, skill1Id, skill2Id, duration, proposedTime, details) {
  
    const parsedUser1Id = parseInt(user1Id, 10);
    const parsedUser2Id = parseInt(user2Id, 10);
    const parsedSkill1Id = parseInt(skill1Id, 10);
    const parsedSkill2Id = parseInt(skill2Id, 10);
    const parsedDuration = parseInt(duration, 10);
  
    if (isNaN(parsedUser1Id) || isNaN(parsedUser2Id) || isNaN(parsedSkill1Id) || isNaN(parsedSkill2Id) || isNaN(parsedDuration)) {
      throw new Error('Invalid input: user IDs, skill IDs, and duration must be integers');
    }
  
    const user1 = await User.findByPk(parsedUser1Id);
    const user2 = await User.findByPk(parsedUser2Id);
    const skill1 = await Skill.findByPk(parsedSkill1Id);
    const skill2 = await Skill.findByPk(parsedSkill2Id);
    
    if (!user1 || !user2 || !skill1 || !skill2) {
      throw new Error('Invalid user or skill');
    }
  
    const user1Skill = await UserSkill.findOne({
      where: { userId: parsedUser1Id, skillId: parsedSkill1Id, isInterested: false }
    });
    const user2Skill = await UserSkill.findOne({
      where: { userId: parsedUser2Id, skillId: parsedSkill2Id, isInterested: false }
    });
    
    if (!user1Skill || !user2Skill) {
      throw new Error('Users do not possess the required skills for this exchange');
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
    await this.notificationService.createNotification(parsedUser2Id, 'New exchange request', notificationContent, exchange.id);
  
    return exchange;
  }

  /**
   * Get details of a specific exchange
   * @param {number} exchangeId - ID of the exchange
   * @returns {Promise<Exchange>} The exchange details
   * @throws {Error} If the exchange is not found
   */
  async getExchange(exchangeId) {
    const exchange = await Exchange.findByPk(exchangeId, {
      include: [
        { model: User, as: 'user1', attributes: ['id', 'name', 'avatar'] },
        { model: User, as: 'user2', attributes: ['id', 'name', 'avatar'] },
        { model: Skill, as: 'skill1', attributes: ['id', 'name'] },
        { model: Skill, as: 'skill2', attributes: ['id', 'name'] }
      ]
    });
  
    if (!exchange) {
      throw new Error('Exchange not found');
    }
  
    const processUser = (user) => {
      if (user) {
        const userData = user.toJSON();
        if (!userData.avatar) {
          userData.avatar = getDefaultAvatarUrl(userData.name);
        } else if (!userData.avatar.startsWith('https://ui-avatars.com')) {
          userData.avatar = `${process.env.API_URL}/uploads/avatars/${userData.avatar}`;
        }
        return userData;
      }
      return null;
    };
  
    exchange.user1 = processUser(exchange.user1);
    exchange.user2 = processUser(exchange.user2);
  
    return exchange;
  }

  /**
   * List exchanges for a user
   * @param {number} userId - ID of the user
   * @param {string} status - Status of the exchanges to filter (optional)
   * @returns {Promise<Array<Exchange>>} List of exchanges
   */
  async listExchanges(userId, status) {
    const whereClause = {};
    if (status) {
      whereClause.status = status;
    }
    whereClause[Op.or] = [{ user1Id: userId }, { user2Id: userId }];
  
    const exchanges = await Exchange.findAll({
      where: whereClause,
      include: [
        { model: User, as: 'user1', attributes: ['id', 'name', 'avatar'] },
        { model: User, as: 'user2', attributes: ['id', 'name', 'avatar'] },
        { model: Skill, as: 'skill1', attributes: ['id', 'name'] },
        { model: Skill, as: 'skill2', attributes: ['id', 'name'] }
      ],
      order: [['createdAt', 'DESC']]
    });

    return exchanges.map(exchange => {
      const exchangeData = exchange.toJSON();
      ['user1', 'user2'].forEach(userKey => {
        if (exchangeData[userKey]) {
          if (!exchangeData[userKey].avatar) {
            exchangeData[userKey].avatar = getDefaultAvatarUrl(exchangeData[userKey].name);
          } else if (!exchangeData[userKey].avatar.startsWith('https://ui-avatars.com')) {
            exchangeData[userKey].avatar = `${process.env.API_URL}/uploads/avatars/${exchangeData[userKey].avatar}`;
          }
        }
      });
      return exchangeData;
    });
  }

  /**
   * Respond to an exchange request
   * @param {number} exchangeId - ID of the exchange
   * @param {number} userId - ID of the user responding
   * @param {string} action - Action to take ('accept' or 'decline')
   * @returns {Promise<Exchange>} The updated exchange
   * @throws {Error} If the exchange is not found or the action is invalid
   */
  async respondToExchangeRequest(exchangeId, userId, action) {
    const exchange = await Exchange.findByPk(exchangeId, {
      include: [
        { model: User, as: 'user1', attributes: ['id', 'name'] },
        { model: User, as: 'user2', attributes: ['id', 'name'] },
        { model: Skill, as: 'skill1', attributes: ['id', 'name'] },
        { model: Skill, as: 'skill2', attributes: ['id', 'name'] }
      ]
    });
  
    if (!exchange) {
      throw new Error('Exchange not found');
    }
  
    if (exchange.user1Id !== userId && exchange.user2Id !== userId) {
      throw new Error('Unauthorized to respond to this exchange request');
    }
  
    if (exchange.status !== 'pending') {
      throw new Error('Can only respond to pending exchange requests');
    }
  
    if (action === 'accept') {
      exchange.status = 'accepted';
      await this.lockTimeCredits(exchange.user1Id, exchange.duration);
    } else if (action === 'decline') {
      exchange.status = 'declined';
    } else {
      throw new Error('Invalid action');
    }
  
    await exchange.save();
  
    const notificationRecipientId = userId === exchange.user1Id ? exchange.user2Id : exchange.user1Id;
    const notificationContent = `Your exchange request for ${exchange.skill2.name} has been ${exchange.status}`;
    await this.notificationService.createNotification(notificationRecipientId, 'Exchange request update', notificationContent, exchange.id);
  
    return exchange;
  }

  /**
   * Complete an exchange
   * @param {number} exchangeId - ID of the exchange
   * @param {number} userId - ID of the user completing the exchange
   * @returns {Promise<Exchange>} The completed exchange
   * @throws {Error} If the exchange is not found or cannot be completed
   */
  async completeExchange(exchangeId, userId) {
    const exchange = await this.getExchange(exchangeId);
  
    if (exchange.user1Id !== userId && exchange.user2Id !== userId) {
      throw new Error('Unauthorized to complete this exchange');
    }
  
    if (exchange.status !== 'accepted') {
      throw new Error('Can only complete accepted exchanges');
    }
  
    exchange.status = 'completed';
    await exchange.save();
  
    await this.transferTimeCredits(exchange.user1Id, exchange.user2Id, exchange.duration);
  
    await this.notificationService.createNotification(exchange.user1Id, 'Exchange completed', `Your exchange for ${exchange.skill1.name} has been completed`);
    await this.notificationService.createNotification(exchange.user2Id, 'Exchange completed', `Your exchange for ${exchange.skill2.name} has been completed`);
  
    return exchange;
  }

  /**
   * Get exchange analytics for a user
   * @param {number} userId - ID of the user
   * @returns {Promise<Object>} Exchange analytics
   */
  async getExchangeAnalytics(userId) {
    const exchanges = await Exchange.findAll({
      where: {
        [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
        status: 'completed'
      },
      include: [
        { model: Skill, as: 'skill1', attributes: ['id', 'name'] },
        { model: Skill, as: 'skill2', attributes: ['id', 'name'] }
      ]
    });
  
    const analytics = {
      totalExchanges: exchanges.length,
      skillsExchanged: new Set(),
      hoursExchanged: 0,
      topSkills: {}
    };
  
    exchanges.forEach(exchange => {
      analytics.skillsExchanged.add(exchange.skill1.name);
      analytics.skillsExchanged.add(exchange.skill2.name);
      analytics.hoursExchanged += exchange.duration;
      analytics.topSkills[exchange.skill1.name] = (analytics.topSkills[exchange.skill1.name] || 0) + 1;
      analytics.topSkills[exchange.skill2.name] = (analytics.topSkills[exchange.skill2.name] || 0) + 1;
    });
  
    analytics.skillsExchanged = Array.from(analytics.skillsExchanged);
    analytics.topSkills = Object.entries(analytics.topSkills)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([skill, count]) => ({ skill, count }));
  
    return analytics;
  }

  /**
   * Calculate average rating for a user
   * @param {number} userId - ID of the user
   * @returns {Promise<number>} Average rating
   */
  async calculateAverageRating(userId) {
    const reviews = await Review.findAll({
      where: { reviewedUserId: userId }
    });
    
    if (reviews.length === 0) return 0;
    
    const totalRating = reviews.reduce((sum, review) => sum + review.rating, 0);
    return totalRating / reviews.length;
  }

  /**
   * Calculate experience level based on skills
   * @param {Array<Object>} skills - Array of skill objects with proficiencyLevel
   * @returns {string} Experience level
   */
  calculateExperienceLevel(skills) {
    const avgProficiency = skills.reduce((sum, skill) => sum + skill.proficiencyLevel, 0) / skills.length;
    if (avgProficiency >= 4.5) return 'Expert';
    if (avgProficiency >= 3.5) return 'Advanced';
    if (avgProficiency >= 2.5) return 'Intermediate';
    return 'Good';
  }

  /**
     * Calculate match percentage between two sets of skills
     * @param {Array<Object>} userSkills - Array of user's skills
     * @param {Array<Object>} matchSkills - Array of skills to match against
     * @returns {number} Match percentage
     */
  calculateMatchPercentage(userSkills, matchSkills) {
    const userSkillSet = new Set(userSkills.map(skill => skill.id));
    const matchSkillSet = new Set(matchSkills.map(skill => skill.id));
    const intersection = new Set([...userSkillSet].filter(x => matchSkillSet.has(x)));
    const union = new Set([...userSkillSet, ...matchSkillSet]);
    return Math.round((intersection.size / union.size) * 100);
  }

  /**
   * Update skill proficiency based on a rating
   * @param {number} userId - ID of the user
   * @param {number} skillId - ID of the skill
   * @param {number} rating - New rating for the skill
   * @throws {Error} If the user doesn't have the skill
   */
  async updateSkillProficiency(userId, skillId, rating) {
    const userSkill = await UserSkill.findOne({ where: { userId, skillId } });

    if (!userSkill) {
      throw new Error('User does not have this skill');
    }

    const proficiencyChange = (rating - 3) * 0.1;
    userSkill.proficiency = Math.max(0, Math.min(5, userSkill.proficiency + proficiencyChange));
    await userSkill.save();

    await blockchainService.updateSkillNFT(userId, skillId, userSkill.proficiency);
  }

  /**
   * Lock time credits for an exchange
   * @param {number} userId - ID of the user
   * @param {number} amount - Amount of time credits to lock
   * @throws {Error} If there are insufficient time credits
   */
  async lockTimeCredits(userId, amount) {
    const userCredits = await TimeCredit.findOne({ where: { userId } });
    if (userCredits.balance < amount) {
      throw new Error('Insufficient time credits');
    }
    userCredits.balance -= amount;
    userCredits.lockedBalance += amount;
    await userCredits.save();
  }

  /**
   * Unlock time credits after an exchange
   * @param {number} userId - ID of the user
   * @param {number} amount - Amount of time credits to unlock
   */
  async unlockTimeCredits(userId, amount) {
    const userCredits = await TimeCredit.findOne({ where: { userId } });
    userCredits.lockedBalance -= amount;
    userCredits.balance += amount;
    await userCredits.save();
  }

  /**
   * Transfer time credits between users
   * @param {number} fromUserId - ID of the user transferring credits
   * @param {number} toUserId - ID of the user receiving credits
   * @param {number} amount - Amount of time credits to transfer
   */
  async transferTimeCredits(fromUserId, toUserId, amount) {
    const fromUserCredits = await TimeCredit.findOne({ where: { userId: fromUserId } });
    const toUserCredits = await TimeCredit.findOne({ where: { userId: toUserId } });

    fromUserCredits.lockedBalance -= amount;
    toUserCredits.balance += amount;

    await Promise.all([fromUserCredits.save(), toUserCredits.save()]);

    await blockchainService.recordTimeCreditsTransfer(fromUserId, toUserId, amount);
  }

  /**
   * Perform an advanced skill search
   * @param {number} userId - ID of the user performing the search
   * @param {string} searchTerm - Search term
   * @param {Object} filters - Additional filters for the search
   * @returns {Promise<Object>} Search results
   */
  async advancedSkillSearch(userId, searchTerm, filters) {

    const { category, level, timeCredit } = filters;

    const user = await User.findByPk(userId, {
      include: [
        {
          model: Skill,
          as: 'Skills',
          through: {
            model: UserSkill,
            where: { isInterested: false }
          }
        },
        {
          model: Skill,
          as: 'InterestedSkills',
          through: {
            model: UserSkill,
            where: { isInterested: true }
          }
        }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    const userKnownSkills = user.Skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      category: skill.category,
      proficiencyLevel: skill.UserSkill.proficiencyLevel
    }));
    const userInterestedSkills = user.InterestedSkills.map(skill => ({
      id: skill.id,
      name: skill.name,
      category: skill.category
    }));

    const whereClause = {
      name: {
        [Op.iLike]: `%${searchTerm}%`
      }
    };

    if (category && category !== 'all') {
      whereClause.category = category;
    }

    const matchingSkills = await Skill.findAll({
      where: whereClause,
      include: [
        {
          model: User,
          as: 'InterestedUsers',
          attributes: ['id', 'name'],
          through: {
            model: UserSkill,
            where: { 
              isInterested: false,
              userId: { [Op.ne]: userId }
            },
            attributes: ['proficiencyLevel']
          },
          required: false
        }
      ]
    });


    const matchedSkills = [];
    const perfectMatches = [];
    const potentialExchanges = [];
    const yourOfferings = [];

    for (const skill of matchingSkills) {
      if (skill.InterestedUsers && skill.InterestedUsers.length > 0) {
        for (const potentialMatch of skill.InterestedUsers) {
          
          const matchUser = await User.findByPk(potentialMatch.id, {
            include: [
              {
                model: Skill,
                as: 'Skills',
                through: {
                  model: UserSkill,
                  where: { isInterested: false }
                }
              },
              {
                model: Skill,
                as: 'InterestedSkills',
                through: {
                  model: UserSkill,
                  where: { isInterested: true }
                }
              }
            ]
          });

          const matchKnownSkills = matchUser.Skills.map(skill => ({
            id: skill.id,
            name: skill.name,
            category: skill.category,
            proficiencyLevel: skill.UserSkill.proficiencyLevel
          }));

          const matchInterestedSkills = matchUser.InterestedSkills.map(skill => ({
            id: skill.id,
            name: skill.name,
            category: skill.category
          }));

          const matchPercentage = this.calculateMatchPercentage(
            userKnownSkills, 
            userInterestedSkills, 
            matchKnownSkills, 
            matchInterestedSkills
          );

          const skillsYouWant = matchKnownSkills.filter(skill => 
            userInterestedSkills.some(interestedSkill => 
              interestedSkill.id === skill.id || interestedSkill.category === skill.category
            )
          );

          const skillsTheyWant = userKnownSkills.filter(skill => 
            matchInterestedSkills.some(interestedSkill => 
              interestedSkill.id === skill.id || interestedSkill.category === skill.category
            )
          );


          const matchedSkill = {
            id: skill.id,
            name: skill.name,
            description: skill.description,
            proficiencyLevel: potentialMatch.UserSkill.proficiencyLevel,
            category: skill.category,
            provider: {
              id: potentialMatch.id,
              name: potentialMatch.name
            },
            matchPercentage
          };

          matchedSkills.push(matchedSkill);

          if (skillsTheyWant.length > 0 && skillsYouWant.length > 0) {
            perfectMatches.push({
              user: potentialMatch,
              skillsYouWant,
              skillsTheyWant,
              matchedSkill
            });
          } else if (skillsYouWant.length > 0) {
            potentialExchanges.push({
              user: potentialMatch,
              skillsYouWant,
              matchedSkill
            });
          } else if (skillsTheyWant.length > 0) {
            yourOfferings.push({
              user: potentialMatch,
              skillsTheyWant,
              matchedSkill
            });
          }
        }
      }
    }

    const rankedMatchedSkills = this.rankSkillsByRelevance(matchedSkills, userInterestedSkills);

    console.log('Search results:', {
      matchedSkills: rankedMatchedSkills.length,
      perfectMatches: perfectMatches.length,
      potentialExchanges: potentialExchanges.length,
      yourOfferings: yourOfferings.length
    });

    return {
      matchedSkills: rankedMatchedSkills,
      perfectMatches,
      potentialExchanges,
      yourOfferings
    };
  }

  /**
   * Calculate match percentage between user skills and potential match skills
   * @param {Array<Object>} userKnownSkills - Array of user's known skills
   * @param {Array<Object>} userInterestedSkills - Array of user's interested skills
   * @param {Array<Object>} matchKnownSkills - Array of potential match's known skills
   * @param {Array<Object>} matchInterestedSkills - Array of potential match's interested skills
   * @returns {number} Match percentage
   */
  calculateMatchPercentage(userKnownSkills, userInterestedSkills, matchKnownSkills, matchInterestedSkills) {
    const userSkillsMatchingOtherInterests = userKnownSkills.filter(skill => 
      matchInterestedSkills.some(interestedSkill => 
        interestedSkill.id === skill.id || interestedSkill.category === skill.category
      )
    ).length;

    const otherSkillsMatchingUserInterests = matchKnownSkills.filter(skill => 
      userInterestedSkills.some(interestedSkill => 
        interestedSkill.id === skill.id || interestedSkill.category === skill.category
      )
    ).length;

    const totalPotentialMatches = userKnownSkills.length + matchKnownSkills.length;

    const matchPercentage = ((userSkillsMatchingOtherInterests + otherSkillsMatchingUserInterests) / totalPotentialMatches) * 100;

    return Math.round(matchPercentage);
  }

  /**
   * Rank skills by relevance to user's interested skills
   * @param {Array<Object>} matchedSkills - Array of matched skills
   * @param {Array<Object>} userInterestedSkills - Array of user's interested skills
   * @returns {Array<Object>} Ranked skills
   */
  rankSkillsByRelevance(matchedSkills, userInterestedSkills) {
    return matchedSkills.sort((a, b) => {
      const aDirectMatch = userInterestedSkills.some(skill => skill.id === a.id);
      const bDirectMatch = userInterestedSkills.some(skill => skill.id === b.id);

      if (aDirectMatch && !bDirectMatch) return -1;
      if (!aDirectMatch && bDirectMatch) return 1;

      if (b.matchPercentage !== a.matchPercentage) {
        return b.matchPercentage - a.matchPercentage;
      }

      return b.proficiencyLevel - a.proficiencyLevel;
    });
  }

  /**
   * Create a review for an exchange
   * @param {number} exchangeId - ID of the exchange
   * @param {number} reviewerId - ID of the user creating the review
   * @param {number} rating - Rating given in the review
   * @param {string} comment - Comment for the review
   * @returns {Promise<Review>} The created review
   * @throws {Error} If the exchange is not found or cannot be reviewed
   */
  async createReview(exchangeId, reviewerId, rating, comment) {
    const exchange = await Exchange.findByPk(exchangeId);
    if (!exchange) {
      throw new Error('Exchange not found');
    }

    if (exchange.status !== 'completed') {
      throw new Error('Can only review completed exchanges');
    }

    const reviewedUserId = exchange.user1Id === reviewerId ? exchange.user2Id : exchange.user1Id;

    const review = await Review.create({
      exchangeId,
      reviewerId,
      reviewedUserId,
      rating,
      comment
    });

    await reputationService.updateReputation(reviewedUserId, rating);

    await this.notificationService.createNotification(reviewedUserId, 'New Review', `You've received a new review for your exchange`);

    return review;
  }

  /**
   * Get reviews for a user
   * @param {number} userId - ID of the user
   * @returns {Promise<Array<Review>>} List of reviews for the user
   */
  async getReviewsForUser(userId) {
    const reviews = await Review.findAll({
      where: { reviewedUserId: userId },
      include: [
        { 
          model: User, 
          as: 'reviewer',
          attributes: ['id', 'name']
        },
        {
          model: Exchange,
          include: [
            { model: Skill, as: 'skill1', attributes: ['id', 'name'] },
            { model: Skill, as: 'skill2', attributes: ['id', 'name'] }
          ]
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return reviews;
  }

  /**
     * Get reviews for an exchange
     * @param {number} exchangeId - ID of the exchange
     * @returns {Promise<Array<Review>>} List of reviews for the exchange
     */
  async getReviewsForExchange(exchangeId) {
    const reviews = await Review.findAll({
      where: { exchangeId },
      include: [
        { 
          model: User, 
          as: 'reviewer',
          attributes: ['id', 'name']
        }
      ],
      order: [['createdAt', 'DESC']]
    });

    return reviews;
  }

  /**
   * Update a review
   * @param {number} reviewId - ID of the review
   * @param {number} reviewerId - ID of the user updating the review
   * @param {number} rating - Updated rating
   * @param {string} comment - Updated comment
   * @returns {Promise<Review>} The updated review
   * @throws {Error} If the review is not found or cannot be updated
   */
  async updateReview(reviewId, reviewerId, rating, comment) {
    const review = await Review.findByPk(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    if (review.reviewerId !== reviewerId) {
      throw new Error('Unauthorized to update this review');
    }

    const oldRating = review.rating;
    review.rating = rating;
    review.comment = comment;
    await review.save();

    const ratingDifference = rating - oldRating;
    await reputationService.updateReputation(review.reviewedUserId, ratingDifference);

    return review;
  }

  /**
   * Delete a review
   * @param {number} reviewId - ID of the review
   * @param {number} reviewerId - ID of the user deleting the review
   * @returns {Promise<Object>} Confirmation message
   * @throws {Error} If the review is not found or cannot be deleted
   */
  async deleteReview(reviewId, reviewerId) {
    const review = await Review.findByPk(reviewId);
    if (!review) {
      throw new Error('Review not found');
    }

    if (review.reviewerId !== reviewerId) {
      throw new Error('Unauthorized to delete this review');
    }

    await reputationService.updateReputation(review.reviewedUserId, -review.rating);

    await review.destroy();

    return { message: 'Review deleted successfully' };
  }

  /**
   * Cancel an exchange
   * @param {number} exchangeId - ID of the exchange
   * @param {number} userId - ID of the user cancelling the exchange
   * @returns {Promise<Exchange>} The cancelled exchange
   * @throws {Error} If the exchange is not found or cannot be cancelled
   */
  async cancelExchange(exchangeId, userId) {
    const exchange = await Exchange.findByPk(exchangeId, {
      include: [
        { model: User, as: 'user1' },
        { model: User, as: 'user2' },
        { model: Skill, as: 'skill1' },
        { model: Skill, as: 'skill2' }
      ]
    });

    if (!exchange) {
      throw new Error('Exchange not found');
    }

    if (exchange.user1Id !== userId && exchange.user2Id !== userId) {
      throw new Error('Unauthorized to cancel this exchange');
    }

    const allowedStatuses = ['pending', 'accepted'];
    if (!allowedStatuses.includes(exchange.status.toLowerCase())) {
      throw new Error(`Can only cancel pending or accepted exchanges. Current status: ${exchange.status}`);
    }

    exchange.status = 'cancelled';
    await exchange.save();

    if (exchange.status.toLowerCase() === 'accepted') {
      await this.unlockTimeCredits(exchange.user1Id, exchange.duration);
    }

    const notifyUserId = userId === exchange.user1Id ? exchange.user2Id : exchange.user1Id;
    const skillName = exchange.skill1 ? exchange.skill1.name : (exchange.skill2 ? exchange.skill2.name : 'Unknown skill');
    
    await this.notificationService.createNotification(notifyUserId, 'Exchange cancelled', `The exchange for ${skillName} has been cancelled`);

    return exchange;
  }
  }

  module.exports = new ExchangeService();