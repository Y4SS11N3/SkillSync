/**
 * @file initialSetupService.js
 * @description Service for handling initial setup operations for new users
 */

const { User, UserSkill } = require('../models/associations');

/**
 * Process initial skills for a new user
 * @param {string} userId - The ID of the user
 * @param {Array<string>} skills - An array of skill IDs
 * @throws {Error} If user is not found or initial setup is already completed
 */
exports.processInitialSkills = async (userId, skills) => {
  const user = await User.findByPk(userId);
  if (!user) {
    throw new Error('User not found');
  }

  if (user.initialSetupComplete) {
    throw new Error('Initial setup already completed');
  }

  const userSkills = skills.map(skillId => ({
    userId,
    skillId,
    proficiencyLevel: 1,
    isInterested: true
  }));

  await UserSkill.bulkCreate(userSkills);

  await user.update({ initialSetupComplete: true });
};