const skillService = require('../services/skillService');

/**
 * Controller for handling skill-related operations.
 * @namespace skillController
 */
const skillController = {
  /**
   * Creates a new skill.
   * @async
   * @function createSkill
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async createSkill(req, res, next) {
    try {
      const { name, description, category } = req.body;
      const newSkill = await skillService.createSkill(name, description, category);
      res.status(201).json(newSkill);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieves a skill by its ID.
   * @async
   * @function getSkill
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getSkill(req, res, next) {
    try {
      const { skillId } = req.params;
      const skill = await skillService.getSkill(skillId);
      res.json(skill);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Updates a skill.
   * @async
   * @function updateSkill
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateSkill(req, res, next) {
    try {
      const { skillId } = req.params;
      const updateData = req.body;
      const updatedSkill = await skillService.updateSkill(skillId, updateData);
      res.json(updatedSkill);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Deletes a skill.
   * @async
   * @function deleteSkill
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteSkill(req, res, next) {
    try {
      const { skillId } = req.params;
      await skillService.deleteSkill(skillId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  /**
   * Adds a skill to a user's profile.
   * @async
   * @function addUserSkill
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async addUserSkill(req, res, next) {
    try {
      const userId = req.user.id;
      const skillData = req.body;
      const userSkill = await skillService.addUserSkill(userId, skillData);
      res.status(201).json(userSkill);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Removes a skill from a user's profile.
   * @async
   * @function deleteUserSkill
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteUserSkill(req, res, next) {
    try {
      const userId = req.user.id;
      const { skillId } = req.params;
      const result = await skillService.deleteUserSkill(userId, skillId);
      res.json(result);
    } catch (error) {
      console.error('Error in deleteUserSkill:', error);
      if (error.message === 'Skill not found for this user') {
        res.status(404).json({ message: error.message });
      } else {
        res.status(500).json({ message: 'Internal Server Error', error: error.message });
      }
    }
  },

  /**
   * Lists skills based on given criteria.
   * @async
   * @function listSkills
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async listSkills(req, res, next) {
    try {
      const { page = 1, limit, category, search } = req.query;
      const skills = await skillService.listSkills(page, limit, category, search);
      res.json(skills);
    } catch (error) {
      console.error('Error in listSkills:', error);
      if (error.message === 'Invalid category') {
        res.status(400).json({ message: 'Invalid category provided' });
      } else {
        next(error);
      }
    }
  },

  /**
   * Retrieves token information for a skill.
   * @async
   * @function getSkillTokenInfo
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getSkillTokenInfo(req, res, next) {
    try {
      const { skillId } = req.params;
      const tokenInfo = await skillService.getSkillTokenInfo(skillId);
      res.json(tokenInfo);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieves skill trends for a user.
   * @async
   * @function getSkillTrends
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getSkillTrends(req, res, next) {
    try {
      const { startDate, endDate } = req.query;
      const userId = req.user.id;
      const trends = await skillService.getSkillTrends(userId, startDate, endDate);
      res.json(trends);
    } catch (error) {
      console.error('Error in getSkillTrends:', error);
      next(error);
    }
  },

  /**
   * Retrieves related skills for a given skill.
   * @async
   * @function getRelatedSkills
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getRelatedSkills(req, res, next) {
    try {
      const skillId = parseInt(req.params.skillId, 10);
      if (isNaN(skillId)) {
        return res.status(400).json({ message: 'Invalid skill ID' });
      }
      const relatedSkills = await skillService.getRelatedSkills(skillId);
      res.json(relatedSkills);
    } catch (error) {
      console.error('Error in getRelatedSkills:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },

  /**
   * Retrieves statistics for a user's skill.
   * @async
   * @function getSkillStatistics
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getSkillStatistics(req, res, next) {
    try {
      const { skillId } = req.params;
      const userId = req.user.id;
      
      const statistics = await skillService.getSkillStatistics(userId, skillId);
      
      if (!statistics) {
        return res.status(404).json({ message: "Skill not found for this user" });
      }
      
      res.json(statistics);
    } catch (error) {
      console.error('Error in getSkillStatistics:', error);
      res.status(500).json({ message: "Internal server error", error: error.message });
    }
  },

  /**
   * Retrieves all skills for a user.
   * @async
   * @function getUserSkills
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getUserSkills(req, res, next) {
    const userId = req.user.id;
    try {
      const skills = await skillService.getUserSkills(userId);
      res.json(skills);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieves trending skills.
   * @async
   * @function getTrendingSkills
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getTrendingSkills(req, res, next) {
    try {
      const trendingSkills = await skillService.getTrendingSkills();
      res.json(trendingSkills);
    } catch (error) {
      console.error('Error in getTrendingSkills:', error);
      res.status(500).json({ message: 'Internal Server Error', error: error.message });
    }
  },
};

module.exports = skillController;