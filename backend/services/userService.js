const { User, Skill, UserSkill, Reputation, TimeCredit } = require('../models/associations');
const matchingService = require('./matchingService');
const logger = require('../utils/logger');
const path = require('path');
const fs = require('fs').promises;

/**
 * Generates a default avatar URL based on the user's name.
 * @param {string} name - The name of the user.
 * @returns {string} The URL of the default avatar.
 */
const getDefaultAvatarUrl = (name) => {
  return `https://ui-avatars.com/api/?name=${encodeURIComponent(name)}&background=random&color=fff`;
};

/**
 * Service for managing user-related operations.
 * @namespace userService
 */
const userService = {
  /**
   * Retrieves a user's profile.
   * @async
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Object>} The user's profile.
   * @throws {Error} If the user is not found.
   */
  async getUserProfile(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'bio', 'location', 'avatar'],
    });
  
    if (!user) {
      throw new Error('User not found');
    }
  
    if (!user.avatar) {
      user.avatar = getDefaultAvatarUrl(user.name);
    } else if (!user.avatar.startsWith('https://ui-avatars.com')) {
      user.avatar = `${process.env.API_URL}/uploads/avatars/${user.avatar}`;
    }
  
    return user;
  },

  /**
   * Updates a user's profile.
   * @async
   * @param {number} userId - The ID of the user.
   * @param {Object} updatedData - The data to update the profile with.
   * @returns {Promise<Object>} The updated user profile.
   * @throws {Error} If the user is not found.
   */
  async updateUserProfile(userId, updatedData) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const allowedUpdates = ['name', 'bio', 'location'];
    Object.keys(updatedData).forEach((key) => {
      if (allowedUpdates.includes(key)) {
        user[key] = updatedData[key];
      }
    });

    await user.save();

    return this.getUserProfile(userId);
  },

  /**
   * Deletes a user's profile.
   * @async
   * @param {number} userId - The ID of the user.
   * @throws {Error} If the user is not found.
   */
  async deleteUserProfile(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    await user.destroy();
  },

  /**
   * Retrieves a user's skills.
   * @async
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Array>} An array of the user's skills.
   */
  async getUserSkills(userId) {
    const userSkills = await UserSkill.findAll({
      where: { userId, isInterested: false },
      include: [{ model: Skill }]
    });
  
    return userSkills.map(userSkill => ({
      id: userSkill.Skill.id,
      name: userSkill.Skill.name,
      description: userSkill.Skill.description,
      category: userSkill.Skill.category,
      proficiencyLevel: userSkill.proficiencyLevel
    }));
  },

  /**
   * Adds a skill to a user's profile.
   * @async
   * @param {number} userId - The ID of the user.
   * @param {string} skillName - The name of the skill to add.
   * @param {number} proficiency - The proficiency level of the skill.
   * @returns {Promise<Object>} The added skill.
   * @throws {Error} If the user is not found.
   */
  async addUserSkill(userId, skillName, proficiency) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    const [skill, created] = await Skill.findOrCreate({
      where: { name: skillName }
    });

    await UserSkill.create({
      userId: user.id,
      skillId: skill.id,
      proficiency
    });

    await matchingService.updateUserSkillData(userId);

    return { id: skill.id, name: skill.name, proficiency };
  },

  /**
   * Updates a user's skill.
   * @async
   * @param {number} userId - The ID of the user.
   * @param {number} skillId - The ID of the skill to update.
   * @param {number} proficiency - The new proficiency level.
   * @returns {Promise<Object>} The updated skill.
   * @throws {Error} If the skill is not found for the user.
   */
  async updateUserSkill(userId, skillId, proficiency) {
    const userSkill = await UserSkill.findOne({
      where: { userId, skillId }
    });

    if (!userSkill) {
      throw new Error('Skill not found for this user');
    }

    userSkill.proficiency = proficiency;
    await userSkill.save();

    await matchingService.updateUserSkillData(userId);

    const skill = await Skill.findByPk(skillId);

    return { id: skill.id, name: skill.name, proficiency: userSkill.proficiency };
  },

  /**
   * Deletes a skill from a user's profile.
   * @async
   * @param {number} userId - The ID of the user.
   * @param {number} skillId - The ID of the skill to delete.
   * @throws {Error} If the skill is not found for the user.
   */
  async deleteUserSkill(userId, skillId) {
    const result = await UserSkill.destroy({
      where: { userId, skillId }
    });

    if (result === 0) {
      throw new Error('Skill not found for this user');
    }

    await matchingService.updateUserSkillData(userId);
  },

  /**
   * Retrieves a user's reputation score.
   * @async
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Object>} The user's reputation score.
   * @throws {Error} If the reputation is not found for the user.
   */
  async getReputationScore(userId) {
    const reputation = await Reputation.findOne({ where: { userId } });

    if (!reputation) {
      throw new Error('Reputation not found for this user');
    }

    return reputation;
  },

  /**
   * Retrieves a user's time credits.
   * @async
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Object>} The user's time credits.
   * @throws {Error} If the time credits are not found for the user.
   */
  async getTimeCredits(userId) {
    const timeCredits = await TimeCredit.findOne({ where: { userId } });

    if (!timeCredits) {
      throw new Error('Time credits not found for this user');
    }

    return timeCredits;
  },

  /**
   * Retrieves a user's skill tokens.
   * @async
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Array>} An array of the user's skill tokens.
   * @throws {Error} If the user is not found.
   */
  async getSkillTokens(userId) {
    const user = await User.findByPk(userId, {
      include: [
        {
          model: Skill,
          through: { attributes: ['proficiency'] },
          as: 'skills'
        }
      ]
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.skills.map(skill => ({
      id: skill.id,
      name: skill.name,
      proficiency: skill.UserSkill.proficiency,
    }));
  },

  /**
   * Generates a skill verification challenge for a user.
   * @async
   * @param {number} userId - The ID of the user.
   * @param {number} skillId - The ID of the skill to verify.
   * @returns {Promise<Object>} The generated challenge.
   * @throws {Error} If the skill is not found for the user.
   */
  async generateSkillVerificationChallenge(userId, skillId) {
    const userSkill = await UserSkill.findOne({
      where: { userId, skillId },
      include: [{ model: Skill, as: 'skill' }]
    });

    if (!userSkill) {
      throw new Error('Skill not found for this user');
    }

    const challenge = await matchingService.generateSkillChallenge(userSkill.skill.name, userSkill.proficiency);

    return challenge;
  },

  /**
   * Verifies a skill challenge response.
   * @async
   * @param {number} userId - The ID of the user.
   * @param {number} skillId - The ID of the skill being verified.
   * @param {string} challengeResponse - The user's response to the challenge.
   * @returns {Promise<Object>} The verification result.
   * @throws {Error} If the skill is not found for the user.
   */
  async verifySkillChallenge(userId, skillId, challengeResponse) {
    const userSkill = await UserSkill.findOne({
      where: { userId, skillId },
      include: [{ model: Skill, as: 'skill' }]
    });

    if (!userSkill) {
      throw new Error('Skill not found for this user');
    }

    const verificationResult = await matchingService.verifySkillChallenge(
      userSkill.skill.name,
      userSkill.proficiency,
      challengeResponse
    );

    return verificationResult;
  },

  /**
   * Updates a user's avatar.
   * @async
   * @param {number} userId - The ID of the user.
   * @param {Object} avatarFile - The new avatar file.
   * @returns {Promise<string>} The URL of the new avatar.
   * @throws {Error} If the user is not found.
   */
  async updateUserAvatar(userId, avatarFile) {
    const user = await User.findByPk(userId);
  
    if (!user) {
      throw new Error('User not found');
    }
  
    if (user.avatar && !user.avatar.startsWith('https://ui-avatars.com')) {
      const oldAvatarPath = path.join(__dirname, '..', 'uploads', 'avatars', user.avatar);
      try {
        await fs.unlink(oldAvatarPath);
      } catch (error) {
        logger.warn(`Failed to delete old avatar: ${error.message}`);
      }
    }
  
    user.avatar = avatarFile.filename;
    await user.save();
  
    return `${process.env.API_URL}/uploads/avatars/${user.avatar}`;
  },

  /**
   * Deletes a user's avatar.
   * @async
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Object>} A message indicating successful deletion.
   * @throws {Error} If the user is not found.
   */
  async deleteUserAvatar(userId) {
    const user = await User.findByPk(userId);

    if (!user) {
      throw new Error('User not found');
    }

    if (user.avatar) {
      const avatarPath = path.join(__dirname, '..', 'uploads', 'avatars', user.avatar);
      try {
        await fs.unlink(avatarPath);
      } catch (error) {
        logger.warn(`Failed to delete avatar file: ${error.message}`);
      }

      user.avatar = null;
      await user.save();
    }

    return { message: 'Avatar deleted successfully' };
  },

  /**
   * Retrieves a user's avatar.
   * @async
   * @param {number} userId - The ID of the user.
   * @returns {Promise<string|null>} The avatar filename or null if not set.
   * @throws {Error} If the user is not found.
   */
  async getUserAvatar(userId) {
    const user = await User.findByPk(userId, {
      attributes: ['avatar']
    });

    if (!user) {
      throw new Error('User not found');
    }

    return user.avatar;
  },

  /**
   * Retrieves a user's known skills.
   * @async
   * @param {number} userId - The ID of the user.
   * @returns {Promise<Array>} An array of the user's known skills.
   */
  async getUserKnownSkills(userId) {
    const knownSkills = await UserSkill.findAll({
      where: { userId, isInterested: false },
      include: [{ model: Skill, attributes: ['id', 'name'] }]
    });
  
    return knownSkills.map(userSkill => ({
      skillId: userSkill.skillId,
      name: userSkill.Skill.name,
      proficiencyLevel: userSkill.proficiencyLevel
    }));
  },
  
  /**
     * Retrieves a user's interested skills.
     * @async
     * @param {number} userId - The ID of the user.
     * @returns {Promise<Array>} An array of the user's interested skills.
     */
  async getUserInterestedSkills(userId) {
    const interestedSkills = await UserSkill.findAll({
      where: { userId, isInterested: true },
      include: [{ model: Skill, attributes: ['id', 'name'] }]
    });

    const mappedSkills = interestedSkills.map(userSkill => ({
      id: userSkill.Skill.id,
      name: userSkill.Skill.name
    }));
    return mappedSkills;
  },

  /**
   * Adds a known skill to a user's profile.
   * @async
   * @param {number} userId - The ID of the user.
   * @param {string} skillName - The name of the skill to add.
   * @param {number} proficiency - The proficiency level of the skill.
   * @returns {Promise<Object>} The created UserSkill object.
   */
  async addUserKnownSkill(userId, skillName, proficiency) {
    const [skill] = await Skill.findOrCreate({ where: { name: skillName } });
    return UserSkill.create({
      userId,
      skillId: skill.id,
      proficiencyLevel: proficiency,
      isInterested: false
    });
  },

  /**
   * Adds an interested skill to a user's profile.
   * @async
   * @param {number} userId - The ID of the user.
   * @param {string} skillName - The name of the skill the user is interested in.
   * @returns {Promise<Object>} The created UserSkill object.
   */
  async addUserInterestedSkill(userId, skillName) {
    const [skill] = await Skill.findOrCreate({ where: { name: skillName } });
    return UserSkill.create({
      userId,
      skillId: skill.id,
      proficiencyLevel: 1,
      isInterested: true
    });
  }
  };

  module.exports = userService;