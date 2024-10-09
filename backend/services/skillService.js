const { Skill, User, Exchange, UserSkill, GlobalSkillDemand } = require('../models/associations');
const { Sequelize, Op } = require('sequelize');

/**
 * Service for managing skills in the system.
 * @namespace skillService
 */
const skillService = {
  /**
   * Creates a new skill.
   * @async
   * @param {string} name - The name of the skill.
   * @param {string} description - The description of the skill.
   * @param {string} category - The category of the skill.
   * @returns {Promise<Object>} The created skill object.
   * @throws {Error} If a skill with the same name already exists.
   */
  async createSkill(name, description, category) {
    const existingSkill = await Skill.findOne({ where: { name } });
    if (existingSkill) {
      throw new Error('Skill with this name already exists');
    }

    const newSkill = await Skill.create({ name, description, category });
    await this.setupSkillTokenization(newSkill.id);
    return newSkill;
  },

  /**
   * Retrieves a skill by its ID.
   * @async
   * @param {number} skillId - The ID of the skill to retrieve.
   * @returns {Promise<Object>} The skill object.
   * @throws {Error} If the skill is not found.
   */
  async getSkill(skillId) {
    const skill = await Skill.findByPk(skillId);
    if (!skill) {
      throw new Error('Skill not found');
    }
    return skill;
  },

  /**
   * Updates a skill.
   * @async
   * @param {number} skillId - The ID of the skill to update.
   * @param {Object} updateData - The data to update the skill with.
   * @returns {Promise<Object>} The updated skill object.
   * @throws {Error} If the skill is not found.
   */
  async updateSkill(skillId, updateData) {
    const skill = await Skill.findByPk(skillId);
    if (!skill) {
      throw new Error('Skill not found');
    }

    const allowedUpdates = ['name', 'description', 'category'];
    Object.keys(updateData).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        skill[key] = updateData[key];
      }
    });

    await skill.save();
    await this.updateSkillTokenization(skillId);
    return skill;
  },

  /**
   * Deletes a skill.
   * @async
   * @param {number} skillId - The ID of the skill to delete.
   * @throws {Error} If the skill is not found or is in use by users.
   */
  async deleteSkill(skillId) {
    const skill = await Skill.findByPk(skillId);
    if (!skill) {
      throw new Error('Skill not found');
    }

    const usersWithSkill = await UserSkill.count({ where: { skillId } });
    if (usersWithSkill > 0) {
      throw new Error('Cannot delete skill as it is currently in use by users');
    }

    await skill.destroy();
    await this.removeSkillTokenization(skillId);
  },

  /**
   * Adds a skill to a user's profile.
   * @async
   * @param {number} userId - The ID of the user.
   * @param {Object} skillData - The skill data to add.
   * @param {number} skillData.skillId - The ID of the skill to add.
   * @param {number} skillData.proficiencyLevel - The proficiency level of the user in this skill.
   * @param {string} skillData.description - A description of the user's experience with this skill.
   * @returns {Promise<Object>} The created or updated UserSkill object.
   * @throws {Error} If the user or skill is not found, or if the user already has the skill.
   */
  async addUserSkill(userId, skillData) {
    const { skillId, proficiencyLevel, description } = skillData;
  
    const user = await User.findByPk(userId);
    if (!user) {
      throw new Error('User not found');
    }
  
    const skill = await Skill.findByPk(skillId);
    if (!skill) {
      throw new Error('Skill not found');
    }
  
    const existingUserSkill = await UserSkill.findOne({
      where: { userId, skillId }
    });
  
    if (existingUserSkill) {
      if (!existingUserSkill.isInterested) {
        throw new Error('User already has this skill');
      } else {
        existingUserSkill.isInterested = false;
        existingUserSkill.proficiencyLevel = proficiencyLevel;
        existingUserSkill.description = description;
        await existingUserSkill.save();
        return existingUserSkill;
      }
    }
  
    const userSkill = await UserSkill.create({
      userId,
      skillId,
      proficiencyLevel,
      description,
      isInterested: false
    });
  
    return userSkill;
  },

  /**
   * Removes a skill from a user's profile.
   * @async
   * @param {number} userId - The ID of the user.
   * @param {number} skillId - The ID of the skill to remove.
   * @returns {Promise<Object>} A message indicating successful removal.
   * @throws {Error} If the skill is not found for the user.
   */
  async deleteUserSkill(userId, skillId) {
    const userSkill = await UserSkill.findOne({
      where: { userId, skillId }
    });

    if (!userSkill) {
      throw new Error('Skill not found for this user');
    }

    await userSkill.destroy();
    return { message: 'Skill successfully removed from user profile' };
  },

  /**
   * Lists skills based on given criteria.
   * @async
   * @param {number} page - The page number for pagination.
   * @param {number} limit - The number of items per page.
   * @param {string} category - The category to filter skills by.
   * @param {string} search - The search term to filter skills by name.
   * @returns {Promise<Object>} An object containing the list of skills and pagination info.
   * @throws {Error} If there's an error in listing skills.
   */
  async listSkills(page, limit, category, search) {
    try {
      const whereClause = {};
  
      if (category && category !== 'all') {
        if (!Skill.rawAttributes.category.values.includes(category)) {
          throw new Error('Invalid category');
        }
        whereClause.category = category;
      }
  
      if (search) {
        whereClause.name = { [Op.iLike]: `%${search}%` };
      }
  
      const queryOptions = {
        where: whereClause,
        order: [['name', 'ASC']]
      };
  
      if (!isNaN(page) && !isNaN(limit) && parseInt(limit) > 0) {
        queryOptions.limit = parseInt(limit);
        queryOptions.offset = (parseInt(page) - 1) * parseInt(limit);
      }
  
      const { count, rows } = await Skill.findAndCountAll(queryOptions);
  
      return {
        skills: rows,
        totalPages: limit ? Math.ceil(count / parseInt(limit)) : 1,
        currentPage: page ? parseInt(page) : 1,
        totalItems: count
      };
    } catch (error) {
      console.error('Error in listSkills:', error);
      throw error;
    }
  },

  /**
   * Sets up tokenization for a skill.
   * @async
   * @param {number} skillId - The ID of the skill to set up tokenization for.
   */
  async setupSkillTokenization(skillId) {
    // Implementation details to be added
  },

  /**
   * Updates tokenization for a skill.
   * @async
   * @param {number} skillId - The ID of the skill to update tokenization for.
   */
  async updateSkillTokenization(skillId) {
    // Implementation details to be added
  },

  /**
   * Removes tokenization for a skill.
   * @async
   * @param {number} skillId - The ID of the skill to remove tokenization for.
   */
  async removeSkillTokenization(skillId) {
    // Implementation details to be added
  },

  /**
   * Gets token information for a skill.
   * @async
   * @param {number} skillId - The ID of the skill to get token info for.
   * @returns {Promise<Object>} An object containing token information for the skill.
   */
  async getSkillTokenInfo(skillId) {
    const skill = await this.getSkill(skillId);
    
    return {
      skillId: skill.id,
      name: skill.name,
      tokenAddress: '0x...',
      totalSupply: 0,
    };
  },

  /**
   * Gets skill trends for a user within a specified date range.
   * @async
   * @param {number} userId - The ID of the user.
   * @param {string} startDate - The start date for the trend analysis.
   * @param {string} endDate - The end date for the trend analysis.
   * @returns {Promise<Array>} An array of skill trends for the user.
   * @throws {Error} If there's an invalid date range provided.
   */
  async getSkillTrends(userId, startDate, endDate) {
    const validStartDate = startDate ? new Date(startDate) : new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
    const validEndDate = endDate ? new Date(endDate) : new Date();
  
    if (isNaN(validStartDate.getTime()) || isNaN(validEndDate.getTime())) {
      throw new Error('Invalid date range provided');
    }
  
    const userSkills = await Skill.findAll({
      where: { userId },
      include: [
        {
          model: Exchange,
          as: 'skill1Exchanges',
          where: {
            createdAt: {
              [Op.between]: [validStartDate, validEndDate]
            }
          },
          required: false
        },
        {
          model: Exchange,
          as: 'skill2Exchanges',
          where: {
            createdAt: {
              [Op.between]: [validStartDate, validEndDate]
            }
          },
          required: false
        },
        {
          model: GlobalSkillDemand,
          where: {
            lastUpdated: {
              [Op.between]: [validStartDate, validEndDate]
            }
          },
          required: false
        }
      ]
    });
  
    const trends = userSkills.map(skill => {
      const exchangeCount = skill.skill1Exchanges.length + skill.skill2Exchanges.length;
      const demandTrend = skill.GlobalSkillDemands.reduce((sum, demand) => sum + demand.demandScore, 0) / skill.GlobalSkillDemands.length || 0;
  
      return {
        skillId: skill.id,
        skillName: skill.name,
        exchangeCount,
        demandTrend,
        proficiencyLevel: skill.proficiencyLevel
      };
    });
  
    return trends;
  },

  /**
   * Gets related skills for a given skill.
   * @async
   * @param {number} skillId - The ID of the skill to find related skills for.
   * @param {number} [limit=10] - The maximum number of related skills to return.
   * @returns {Promise<Array>} An array of related skills.
   * @throws {Error} If the base skill is not found or there's an error fetching related skills.
   */
  async getRelatedSkills(skillId, limit = 10) {
    try {
      const baseSkill = await this.getSkill(skillId);
      if (!baseSkill) {
        throw new Error('Base skill not found');
      }
  
      const relatedSkills = await Skill.findAll({
        where: {
          id: {
            [Op.ne]: skillId
          }
        },
        include: [
          {
            model: User,
            attributes: ['id', 'name']
          }
        ],
        limit
      });
  
      const scoredSkills = relatedSkills.map(skill => ({
        id: skill.id,
        name: skill.name,
        description: skill.description,
        proficiencyLevel: skill.proficiencyLevel,
        userId: skill.userId,
        user: skill.User ? { id: skill.User.id, name: skill.User.name } : null,
        relevanceScore: Math.random()
      }));
  
      return scoredSkills.sort((a, b) => b.relevanceScore - a.relevanceScore);
    } catch (error) {
      console.error('Error fetching related skills:', error);
      throw new Error('Failed to fetch related skills');
    }
  },

  /**
     * Gets trending skills based on recent exchanges and proficiency levels.
     * @async
     * @param {number} [limit=10] - The maximum number of trending skills to return.
     * @returns {Promise<Array>} An array of trending skills with their statistics.
     */
  async getTrendingSkills(limit = 10) {
    const oneMonthAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);

    const trendingSkills = await Skill.findAll({
      attributes: [
        'id',
        'name',
        [Sequelize.fn('COALESCE', Sequelize.fn('COUNT', Sequelize.col('skill1Exchanges.id')), 0), 'exchangeCount1'],
        [Sequelize.fn('COALESCE', Sequelize.fn('COUNT', Sequelize.col('skill2Exchanges.id')), 0), 'exchangeCount2'],
        [Sequelize.fn('AVG', Sequelize.col('Skill.proficiencyLevel')), 'avgProficiency']
      ],
      include: [
        {
          model: Exchange,
          as: 'skill1Exchanges',
          attributes: [],
          where: {
            createdAt: { [Sequelize.Op.gte]: oneMonthAgo }
          },
          required: false
        },
        {
          model: Exchange,
          as: 'skill2Exchanges',
          attributes: [],
          where: {
            createdAt: { [Sequelize.Op.gte]: oneMonthAgo }
          },
          required: false
        }
      ],
      group: ['Skill.id'],
      order: [
        [Sequelize.literal('(COALESCE(COUNT("skill1Exchanges"."id"), 0) + COALESCE(COUNT("skill2Exchanges"."id"), 0)) * COALESCE(AVG("Skill"."proficiencyLevel"), 0)'), 'DESC']
      ],
      limit: limit,
      subQuery: false
    });

    return trendingSkills.map(skill => ({
      id: skill.id,
      name: skill.name,
      exchangeCount: parseInt(skill.get('exchangeCount1'), 10) + parseInt(skill.get('exchangeCount2'), 10),
      avgProficiency: parseFloat(skill.get('avgProficiency')).toFixed(2),
      trendScore: ((parseInt(skill.get('exchangeCount1'), 10) + parseInt(skill.get('exchangeCount2'), 10)) * parseFloat(skill.get('avgProficiency'))).toFixed(2)
    }));
  },

  /**
   * Gets all skills associated with a user.
   * @async
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Array>} An array of user skills.
   * @throws {Error} If there's an error fetching user skills.
   */
  async getUserSkills(userId) {
    try {
      const userSkills = await UserSkill.findAll({
        where: { userId: userId },
        include: [{
          model: Skill,
          attributes: ['id', 'name', 'category']
        }]
      });
      
      const formattedSkills = userSkills.map(userSkill => ({
        id: userSkill.Skill.id,
        name: userSkill.Skill.name,
        category: userSkill.Skill.category,
        proficiencyLevel: userSkill.proficiencyLevel,
        description: userSkill.description
      }));
      
      return formattedSkills;
    } catch (error) {
      throw error;
    }
  },

  /**
   * Gets statistics for a specific skill of a user.
   * @async
   * @param {number} userId - The ID of the user.
   * @param {number} skillId - The ID of the skill.
   * @returns {Promise<Object|null>} An object containing skill statistics or null if not found.
   */
  async getSkillStatistics(userId, skillId) {
    const skill = await Skill.findOne({
      where: { id: skillId, userId: userId },
      include: [
        {
          model: Exchange,
          as: 'skill1Exchanges',
          attributes: ['createdAt']
        },
        {
          model: Exchange,
          as: 'skill2Exchanges',
          attributes: ['createdAt']
        },
        {
          model: GlobalSkillDemand,
          attributes: ['demandScore', 'lastUpdated']
        },
        {
          model: User,
          attributes: ['id', 'name', 'email']
        }
      ]
    });

    if (!skill) {
      return null;
    }

    const allExchanges = [...(skill.skill1Exchanges || []), ...(skill.skill2Exchanges || [])];
    const latestExchange = allExchanges.length > 0 ? 
      new Date(Math.max(...allExchanges.map(e => e.createdAt))) : null;

    const thirtyDaysAgo = new Date();
    thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);

    const recentExchanges = allExchanges.filter(e => e.createdAt >= thirtyDaysAgo);

    const averageDemand = skill.GlobalSkillDemands && skill.GlobalSkillDemands.length > 0
      ? skill.GlobalSkillDemands.reduce((sum, demand) => sum + demand.demandScore, 0) / skill.GlobalSkillDemands.length
      : 0;

    const statistics = {
      skillId: skill.id,
      skillName: skill.name,
      currentProficiency: skill.proficiencyLevel,
      totalExchanges: allExchanges.length,
      recentExchanges: recentExchanges.length,
      lastExchangeDate: latestExchange,
      averageDemand,
      user: skill.User ? {
        id: skill.User.id,
        name: skill.User.name,
        email: skill.User.email
      } : null
    };

    return statistics;
  }
  };

  module.exports = skillService;