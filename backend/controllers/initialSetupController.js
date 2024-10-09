/**
 * @file initialSetupController.js
 * @description Controller for handling initial setup operations for new users
 */

const initialSetupService = require('../services/initialSetupService');
const { User } = require('../models/associations');

/**
 * Submit initial skills for a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
exports.submitInitialSkills = async (req, res) => {
  try {
    const { skills } = req.body;
    const userId = req.user.id;

    if (!Array.isArray(skills) || skills.length < 3) {
      return res.status(400).json({ error: 'Please select at least 3 skills' });
    }

    await initialSetupService.processInitialSkills(userId, skills);

    const updatedUser = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'initialSetupComplete']
    });

    if (!updatedUser.initialSetupComplete) {
      await updatedUser.update({ initialSetupComplete: true });
    }

    res.status(200).json({ 
      message: 'Initial skills submitted successfully',
      user: updatedUser
    });
  } catch (error) {
    console.error('Error in submitInitialSkills:', error);
    res.status(500).json({ error: 'An error occurred while submitting initial skills' });
  }
};