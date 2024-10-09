/**
 * @file authService.js
 * @description Service for handling authentication operations
 */

const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const User = require('../models/User');

/**
 * Register a new user
 * @param {string} name - The user's name
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @returns {Object} An object containing the user ID and JWT token
 * @throws {Error} If registration fails
 */
exports.register = async (name, email, password) => {
  try {
    const existingUser = await User.findOne({ where: { email } });
    if (existingUser) {
      throw new Error('User with this email already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 10);

    const user = await User.create({
      name,
      email,
      password: hashedPassword,
      initialSetupComplete: false
    });

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1y' }
    );

    console.log('User registered:', {
      id: user.id,
      name: user.name,
      email: user.email,
      initialSetupComplete: user.initialSetupComplete
    });

    return { userId: user.id, token };
  } catch (error) {
    console.error('Error in register function:', error.message);
    throw error;
  }
};

/**
 * Login a user
 * @param {string} email - The user's email
 * @param {string} password - The user's password
 * @returns {Object} An object containing the user ID and JWT token
 * @throws {Error} If login fails
 */
exports.login = async (email, password) => {
  try {
    const user = await User.findOne({ where: { email } });
    if (!user) {
      throw new Error('Invalid email or password');
    }

    const isPasswordValid = await user.comparePassword(password);

    if (!isPasswordValid) {
      throw new Error('Invalid email or password');
    }

    const token = jwt.sign(
      { userId: user.id, email: user.email },
      process.env.JWT_SECRET,
      { expiresIn: '1y' }
    );

    return { userId: user.id, token };
  } catch (error) {
    console.error('Error in login function:', error.message);
    throw error;
  }
};