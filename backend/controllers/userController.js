const userService = require('../services/userService');

/**
 * Controller for handling user-related operations.
 * @namespace userController
 */
const userController = {
  /**
   * Retrieves the user profile.
   * @async
   * @function getUserProfile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getUserProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const userProfile = await userService.getUserProfile(userId);
      res.json(userProfile);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Updates the user profile.
   * @async
   * @function updateUserProfile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateUserProfile(req, res, next) {
    try {
      const userId = req.user.id;
      const updatedData = req.body;
      const updatedProfile = await userService.updateUserProfile(userId, updatedData);
      res.json(updatedProfile);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Deletes the user profile.
   * @async
   * @function deleteUserProfile
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteUserProfile(req, res, next) {
    try {
      const userId = req.user.id;
      await userService.deleteUserProfile(userId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieves user skills.
   * @async
   * @function getUserSkills
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getUserSkills(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      const skills = await userService.getUserSkills(userId);
      res.json(skills);
    } catch (error) {
      console.error('Error in getUserSkills:', error);
      if (error.message === 'User not found') {
        res.status(404).json({ message: 'User not found' });
      } else {
        next(error);
      }
    }
  },

  /**
   * Adds a new skill to the user profile.
   * @async
   * @function addUserSkill
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async addUserSkill(req, res, next) {
    try {
      const userId = req.user.id;
      const { skillName, proficiency } = req.body;
      const newSkill = await userService.addUserSkill(userId, skillName, proficiency);
      res.status(201).json(newSkill);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Updates a user's skill.
   * @async
   * @function updateUserSkill
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateUserSkill(req, res, next) {
    try {
      const userId = req.user.id;
      const { skillId } = req.params;
      const { proficiency } = req.body;
      const updatedSkill = await userService.updateUserSkill(userId, skillId, proficiency);
      res.json(updatedSkill);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Deletes a user's skill.
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
      await userService.deleteUserSkill(userId, skillId);
      res.status(204).send();
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieves the user's reputation score.
   * @async
   * @function getReputationScore
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getReputationScore(req, res, next) {
    try {
      const userId = req.user.id;
      const reputation = await userService.getReputationScore(userId);
      res.json(reputation);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieves the user's time credits.
   * @async
   * @function getTimeCredits
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getTimeCredits(req, res, next) {
    try {
      const userId = req.user.id;
      const timeCredits = await userService.getTimeCredits(userId);
      res.json(timeCredits);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieves the user's skill tokens.
   * @async
   * @function getSkillTokens
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getSkillTokens(req, res, next) {
    try {
      const userId = req.user.id;
      const skillTokens = await userService.getSkillTokens(userId);
      res.json(skillTokens);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Updates the user's avatar.
   * @async
   * @function updateUserAvatar
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async updateUserAvatar(req, res, next) {
    try {
      const userId = req.user.id;
      if (!req.file) {
        return res.status(400).json({ message: 'No file uploaded' });
      }
      const avatarUrl = await userService.updateUserAvatar(userId, req.file);
      res.json({ avatar: avatarUrl });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Deletes the user's avatar.
   * @async
   * @function deleteUserAvatar
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async deleteUserAvatar(req, res, next) {
    try {
      const userId = req.user.id;
      const result = await userService.deleteUserAvatar(userId);
      res.json(result);
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieves the user's avatar.
   * @async
   * @function getUserAvatar
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getUserAvatar(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      const avatar = await userService.getUserAvatar(userId);
      res.json({ avatar });
    } catch (error) {
      next(error);
    }
  },

  /**
   * Retrieves the user's known skills.
   * @async
   * @function getUserKnownSkills
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getUserKnownSkills(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      const skills = await userService.getUserKnownSkills(userId);
      res.json(skills);
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Retrieves the user's interested skills.
   * @async
   * @function getUserInterestedSkills
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async getUserInterestedSkills(req, res, next) {
    try {
      const userId = req.params.userId || req.user.id;
      const skills = await userService.getUserInterestedSkills(userId);
      res.json(skills);
    } catch (error) {
      console.error('Error in userController.getUserInterestedSkills:', error);
      next(error);
    }
  },
  
  /**
   * Adds a known skill to the user's profile.
   * @async
   * @function addUserKnownSkill
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async addUserKnownSkill(req, res, next) {
    try {
      const userId = req.user.id;
      const { skillName, proficiency } = req.body;
      const newSkill = await userService.addUserKnownSkill(userId, skillName, proficiency);
      res.status(201).json(newSkill);
    } catch (error) {
      next(error);
    }
  },
  
  /**
   * Adds an interested skill to the user's profile.
   * @async
   * @function addUserInterestedSkill
   * @param {Object} req - Express request object
   * @param {Object} res - Express response object
   * @param {Function} next - Express next middleware function
   */
  async addUserInterestedSkill(req, res, next) {
    try {
      const userId = req.user.id;
      const { skillName } = req.body;
      const newSkill = await userService.addUserInterestedSkill(userId, skillName);
      res.status(201).json(newSkill);
    } catch (error) {
      next(error);
    }
  }
};

module.exports = userController;