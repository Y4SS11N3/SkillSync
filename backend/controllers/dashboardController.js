/**
 * Dashboard Controller
 * 
 * This controller handles various dashboard-related operations for the SkillSync application.
 * It includes functions for fetching dashboard data, user skills, exchange history,
 * user reputation, skill matches, upcoming exchanges, achievements, learning goals,
 * and personalized recommendations.
 * 
 * @module controllers/dashboardController
 */

const { Op, Sequelize } = require('sequelize');
const { 
  User, 
  Skill, 
  Exchange, 
  Reputation, 
  Review, 
  LearningGoal, 
  Achievement, 
  UserSkill 
} = require('../models/associations');
const ReputationService = require('../services/reputationService');

/**
 * Get dashboard data for a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getDashboardData = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      include: [
        { model: Reputation },
        { 
          model: Review, 
          as: 'reviewsReceived',
          limit: 5,
          order: [['createdAt', 'DESC']],
          include: [{ model: User, as: 'reviewer', attributes: ['name'] }]
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const currentDate = new Date();
    const lastMonth = new Date(currentDate.getFullYear(), currentDate.getMonth() - 1, currentDate.getDate());

    const [totalConnections, hoursExchanged, skillsLearned] = await Promise.all([
      Exchange.count({
        where: {
          [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
          status: 'completed'
        },
        distinct: true,
        col: 'id'
      }),
      Exchange.sum('duration', {
        where: {
          [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
          status: 'completed'
        }
      }),
      Skill.count({
        include: [{
          model: Exchange,
          as: 'skill2Exchanges',
          where: { user2Id: userId, status: 'completed' }
        }]
      })
    ]);

    const reputationData = await ReputationService.getUserReputation(userId);

    const responseData = {
      totalConnections: totalConnections || 0,
      hoursExchanged: hoursExchanged ? Math.round(hoursExchanged / 60) : 0,
      skillsLearned: skillsLearned || 0,
      timeCredits: user.timeCredits || 0,
      ...reputationData,
      reviews: user.reviewsReceived.map(review => ({
        rating: review.rating,
        comment: review.comment,
        date: review.createdAt,
        reviewerName: review.reviewer.name
      }))
    };

    res.json(responseData);
  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    res.status(500).json({ message: 'Error fetching dashboard data', error: error.message });
  }
};

/**
 * Get user skills
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserSkills = async (req, res) => {
  try {
    const userId = req.user.id;

    const exchangedSkills = await Exchange.findAll({
      where: {
        [Op.or]: [{ user1Id: userId }, { user2Id: userId }],
        status: 'completed'
      },
      include: [
        {
          model: Skill,
          as: 'skill1',
          attributes: ['id', 'name', 'category'],
        },
        {
          model: Skill,
          as: 'skill2',
          attributes: ['id', 'name', 'category'],
        }
      ],
      attributes: [
        'id',
        'user1Id',
        'user2Id',
        'skill1Id',
        'skill2Id',
        'createdAt',
        [Sequelize.fn('COUNT', Sequelize.col('Exchange.id')), 'exchangeCount']
      ],
      group: ['Exchange.id', 'skill1.id', 'skill2.id'],
      order: [['createdAt', 'DESC']]
    });

    const skillMap = new Map();

    exchangedSkills.forEach(exchange => {
      const isLearner = exchange.user2Id === userId;
      const skill = isLearner ? exchange.skill1 : exchange.skill2;
      
      if (!skillMap.has(skill.id)) {
        skillMap.set(skill.id, {
          id: skill.id,
          name: skill.name,
          category: skill.category,
          totalExchanges: 0,
          lastExchangeDate: null,
          proficiencyLevel: 1,
        });
      }

      const skillData = skillMap.get(skill.id);
      skillData.totalExchanges += parseInt(exchange.get('exchangeCount'), 10);
      skillData.lastExchangeDate = skillData.lastExchangeDate 
        ? new Date(Math.max(new Date(skillData.lastExchangeDate), new Date(exchange.createdAt)))
        : new Date(exchange.createdAt);

      skillData.proficiencyLevel = Math.min(5, Math.floor(skillData.totalExchanges / 2) + 1);
    });

    const skillsWithProgress = Array.from(skillMap.values()).map(skill => ({
      ...skill,
      progress: calculateSkillProgress(skill.proficiencyLevel, skill.totalExchanges, skill.lastExchangeDate)
    }));

    res.json(skillsWithProgress);
  } catch (error) {
    console.error('Error fetching user exchanged skills:', error);
    res.status(500).json({ message: 'Error fetching user exchanged skills', error: error.message });
  }
};

/**
 * Get exchange history
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getExchangeHistory = async (req, res) => {
  try {
    const exchanges = await Exchange.findAll({
      where: {
        [Op.or]: [{ user1Id: req.user.id }, { user2Id: req.user.id }]
      },
      order: [['scheduledTime', 'DESC']],
      limit: 7,
      include: [
        { model: User, as: 'user1', attributes: ['id', 'name'] },
        { model: User, as: 'user2', attributes: ['id', 'name'] },
        { model: Skill, as: 'skill1', attributes: ['id', 'name'] },
        { model: Skill, as: 'skill2', attributes: ['id', 'name'] }
      ]
    });

    const formattedExchanges = exchanges.map(exchange => {
      const isUser1 = exchange.user1Id === req.user.id;
      return {
        id: exchange.id,
        skill: isUser1 ? exchange.skill2.name : exchange.skill1.name,
        type: isUser1 ? 'taught' : 'learned',
        partnerName: isUser1 ? exchange.user2.name : exchange.user1.name,
        duration: exchange.duration,
        date: exchange.scheduledTime,
        status: exchange.status
      };
    });

    res.json(formattedExchanges);
  } catch (error) {
    console.error('Error fetching exchange history:', error);
    res.status(500).json({ message: 'Error fetching exchange history', error: error.message });
  }
};

/**
 * Get user reputation
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUserReputation = async (req, res) => {
  try {
    const userId = req.user.id;
    const reputationData = await ReputationService.getUserReputation(userId);
    res.json(reputationData);
  } catch (error) {
    console.error('Error fetching user reputation:', error);
    res.status(500).json({ message: 'Error fetching user reputation', error: error.message });
  }
};

/**
 * Get skill matches
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getSkillMatches = async (req, res) => {
  try {
    const userId = req.user.id;

    const currentUser = await User.findByPk(userId, {
      include: [
        {
          model: Skill,
          as: 'Skills',
          attributes: ['id', 'name', 'category'],
          through: {
            attributes: ['proficiencyLevel'],
            where: { isInterested: false }
          }
        }
      ]
    });

    if (!currentUser) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userSkills = currentUser.Skills.map(skill => skill.name);
    const userCategories = [...new Set(currentUser.Skills.map(skill => skill.category))];

    const potentialMatches = await User.findAll({
      where: {
        id: { [Op.ne]: userId }
      },
      include: [{
        model: Skill,
        as: 'Skills',
        attributes: ['name', 'category'],
        through: {
          attributes: ['proficiencyLevel'],
          where: { isInterested: false }
        }
      }],
      limit: 10
    });

    const scoredMatches = potentialMatches.map(match => {
      const matchSkills = match.Skills.map(skill => skill.name);
      const matchCategories = [...new Set(match.Skills.map(skill => skill.category))];
      
      const skillMatchScore = matchSkills.filter(skill => userSkills.includes(skill)).length;
      const categoryMatchScore = matchCategories.filter(category => userCategories.includes(category)).length;
      const totalScore = skillMatchScore * 2 + categoryMatchScore;

      return {
        ...match.toJSON(),
        score: totalScore,
        skills: matchSkills
      };
    }).sort((a, b) => b.score - a.score);

    const topMatches = scoredMatches.slice(0, 3);

    const formattedMatches = topMatches.map(match => ({
      id: match.id,
      name: match.name,
      avatar: match.avatar,
      title: match.title || 'SkillSync User',
      skills: match.skills
    }));

    res.json(formattedMatches);
  } catch (error) {
    console.error('Error fetching skill matches:', error);
    res.status(500).json({ message: 'Error fetching skill matches', error: error.message });
  }
};

/**
 * Get upcoming exchanges
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getUpcomingExchanges = async (req, res) => {
  try {
    const exchanges = await Exchange.findAll({
      where: {
        [Op.or]: [{ user1Id: req.user.id }, { user2Id: req.user.id }],
        scheduledTime: { [Op.gte]: new Date() },
        status: 'accepted'
      },
      order: [['scheduledTime', 'ASC']],
      limit: 2,
      include: [
        { model: User, as: 'user1', attributes: ['id', 'name'] },
        { model: User, as: 'user2', attributes: ['id', 'name'] },
        { model: Skill, as: 'skill1', attributes: ['id', 'name'] },
        { model: Skill, as: 'skill2', attributes: ['id', 'name'] }
      ]
    });

    const formattedExchanges = exchanges.map(exchange => {
      const isUser1 = exchange.user1Id === req.user.id;
      return {
        id: exchange.id,
        partnerName: isUser1 ? exchange.user2.name : exchange.user1.name,
        skill: isUser1 ? exchange.skill2.name : exchange.skill1.name,
        scheduledTime: exchange.scheduledTime,
        duration: exchange.duration
      };
    });

    res.json(formattedExchanges);
  } catch (error) {
    console.error('Error fetching upcoming exchanges:', error);
    res.status(500).json({ message: 'Error fetching upcoming exchanges', error: error.message });
  }
};

/**
 * Get achievements
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getAchievements = async (req, res) => {
  try {
    const achievements = await Achievement.findAll({
      where: { userId: req.user.id },
      order: [['achievedAt', 'DESC']]
    });
    res.json(achievements);
  } catch (error) {
    console.error('Error fetching achievements:', error);
    res.status(500).json({ message: 'Error fetching achievements', error: error.message });
  }
};

/**
 * Get learning goals
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getLearningGoals = async (req, res) => {
  try {
    const userId = req.user.id;

    const learningGoals = await LearningGoal.findAll({
      where: { userId },
      include: [{ model: Skill, attributes: ['name'] }],
      order: [['createdAt', 'DESC']]
    });

    const currentDate = new Date();

    const formattedGoals = learningGoals.map(goal => {
      const progress = calculateProgress(goal.currentLevel, goal.targetLevel);
      const daysRemaining = calculateDaysRemaining(currentDate, goal.deadline);

      return {
        id: goal.id,
        skill: goal.Skill.name,
        currentLevel: goal.currentLevel,
        targetLevel: goal.targetLevel,
        progress,
        targetDate: goal.deadline.toISOString().split('T')[0],
        daysRemaining,
        status: goal.status
      };
    });

    res.json(formattedGoals);
  } catch (error) {
    console.error('Error fetching learning goals:', error);
    res.status(500).json({ message: 'Error fetching learning goals', error: error.message });
  }
};

/**
 * Add a new learning goal
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.addToLearningGoals = async (req, res) => {
  try {
    const { skillId, targetLevel, deadline } = req.body;
    const userId = req.user.id;

    const skill = await Skill.findByPk(skillId);
    if (!skill) {
      return res.status(404).json({ message: 'Skill not found' });
    }

    const newGoal = await LearningGoal.create({
      userId,
      skillId,
      currentLevel: 1,
      targetLevel,
      deadline: new Date(deadline),
      status: 'in_progress'
    });

    const goalWithSkill = await LearningGoal.findByPk(newGoal.id, {
      include: [{ model: Skill, attributes: ['name'] }]
    });

    res.status(201).json(goalWithSkill);
  } catch (error) {
    console.error('Error adding to learning goals:', error);
    res.status(500).json({ message: 'Error adding to learning goals', error: error.message });
  }
};

/**
 * Get personalized recommendations
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.getPersonalizedRecommendations = async (req, res) => {
  try {
    const userId = req.user.id;
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Skill,
          as: 'InterestedSkills',
          attributes: ['id', 'name', 'description', 'category'],
          through: { attributes: [] }
        }
      ]
    });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const userInterests = user.InterestedSkills.map(skill => ({
      ...skill.toJSON(),
      isUserInterest: true
    }));

    const skillsToExclude = userInterests.map(skill => skill.id);
    const userCategories = userInterests.map(skill => skill.category);

    const relatedRecommendations = await Skill.findAll({
      where: {
        id: { [Op.notIn]: skillsToExclude },
        userId: { [Op.ne]: userId },
        category: { [Op.in]: userCategories }
      },
      include: [
        {
          model: User,
          attributes: ['id', 'name']
        }
      ],
      limit: 5 - userInterests.length
    });

    const recommendations = [
      ...userInterests,
      ...relatedRecommendations.map(skill => ({
        ...skill.toJSON(),
        isUserInterest: false
      }))
    ];

    res.json(recommendations);
  } catch (error) {
    console.error('Error fetching personalized recommendations:', error);
    res.status(500).json({ message: 'Error fetching personalized recommendations', error: error.message });
  }
};

/**
 * Calculate progress percentage
 * @param {number} currentLevel - Current skill level
 * @param {number} targetLevel - Target skill level
 * @returns {number} Progress percentage
 */
function calculateProgress(currentLevel, targetLevel) {
  const progress = ((currentLevel - 1) / (targetLevel - 1)) * 100;
  return Math.round(progress);
}

/**
 * Calculate days remaining until deadline
 * @param {Date} currentDate - Current date
 * @param {Date} targetDate - Target date
 * @returns {number} Number of days remaining
 */
function calculateDaysRemaining(currentDate, targetDate) {
  const diffTime = targetDate.getTime() - currentDate.getTime();
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  return Math.max(diffDays, 0);
}

/**
 * Calculate skill progress
 * @param {number} proficiencyLevel - Current proficiency level
 * @param {number} totalExchanges - Total number of exchanges
 * @param {Date} lastExchangeDate - Date of the last exchange
 * @returns {number} Calculated progress
 */
function calculateSkillProgress(proficiencyLevel, totalExchanges, lastExchangeDate) {
  const MAX_PROFICIENCY_LEVEL = 5;
  const THIRTY_DAYS_IN_MS = 30 * 24 * 60 * 60 * 1000;

  let progress = (proficiencyLevel / MAX_PROFICIENCY_LEVEL) * 100;
  
  const exchangeBonus = Math.min(totalExchanges * 2, 20);
  const recencyBonus = lastExchangeDate && (new Date() - lastExchangeDate) < THIRTY_DAYS_IN_MS ? 5 : 0;
  
  progress = Math.min(progress + exchangeBonus + recencyBonus, 100);
  
  return Math.round(progress);
}