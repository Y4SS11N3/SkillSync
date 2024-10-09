/**
 * @file authController.js
 * @description Controller for handling authentication-related operations
 */

const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const authService = require('../services/authService');
const { User, Reputation, Skill } = require('../models/associations');

/**
 * Generate access and refresh tokens for a user
 * @param {string} userId - The user's ID
 * @returns {Object} An object containing the access token and refresh token
 */
const generateTokens = (userId) => {
  const accessToken = jwt.sign({ userId }, process.env.JWT_SECRET, { expiresIn: '1y' });
  const refreshToken = jwt.sign({ userId }, process.env.JWT_REFRESH_SECRET, { expiresIn: '1y' });
  return { accessToken, refreshToken };
};

/**
 * Login a user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const loginUser = async (req, res) => {
  try {
    const { email, password } = req.body;
    
    const { userId, token } = await authService.login(email, password);
    
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email', 'initialSetupComplete']
    });
    
    res.json({ accessToken: token, user });
  } catch (error) {
    console.error(`Login error: ${error.message}`);
    res.status(401).json({ error: error.message });
  }
};

/**
 * Register a new user
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const registerUser = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const { userId, token } = await authService.register(name, email, password);
    await Reputation.create({ userId });
    const user = await User.findByPk(userId, {
      attributes: ['id', 'name', 'email']
    });
    res.status(201).json({ accessToken: token, user });
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

/**
 * Get user profile
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const getUserProfile = async (req, res) => {
  try {
    const user = await User.findByPk(req.user.id, {
      attributes: { exclude: ['password'] },
      include: [{ model: Skill, as: 'Skills' }]
    });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    res.json({ user });
  } catch (error) {
    res.status(500).json({ 
      error: 'An error occurred while fetching the user profile',
      details: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

/**
 * Logout a user (client-side)
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const logoutUser = async (req, res) => {
  res.json({ message: 'Logged out successfully' });
};

/**
 * Refresh the access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const refreshToken = async (req, res) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      return res.status(400).json({ error: 'Refresh token is required' });
    }
    const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(decoded.userId);
    res.json({ accessToken, refreshToken: newRefreshToken });
  } catch (error) {
    res.status(401).json({ error: 'Invalid refresh token' });
  }
};

/**
 * Validate the access token
 * @param {Object} req - Express request object
 * @param {Object} res - Express response object
 */
const validateToken = async (req, res) => {
  try {
    const user = req.user;
    res.json({ 
      valid: true, 
      user: {
        id: user.id,
        name: user.name,
        email: user.email
      } 
    });
  } catch (error) {
    res.status(401).json({ valid: false, error: 'Invalid token' });
  }
};

module.exports = {
  generateTokens,
  loginUser,
  registerUser,
  getUserProfile,
  logoutUser,
  refreshToken,
  validateToken
};