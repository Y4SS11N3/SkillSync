const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const authMiddleware = require('../middlewares/authMiddleware');
const { User } = require('../models/associations');

// Public routes
router.post('/login', authController.loginUser);
router.post('/register', authController.registerUser);
router.post('/refresh-token', authController.refreshToken);

// Protected routes
router.get('/me', authMiddleware, authController.getUserProfile);
router.post('/logout', authMiddleware, authController.logoutUser);
router.get('/validate', authMiddleware, authController.validateToken);

module.exports = router;