const express = require('express');
const router = express.Router();
const { body } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');
const ChatController = require('../controllers/chatController');

// Apply auth middleware to all routes
router.use(authMiddleware);

// Initialize ChatController
const initChatController = (req, res, next) => {
  req.chatController = new ChatController(req.io);
  next();
};

router.use(initChatController);

// Send a message
router.post('/send', [
  body('content').notEmpty().trim().escape(),
  body('chatId').optional().isInt(),
  body('exchangeId').optional().isInt()
], (req, res) => req.chatController.sendMessage(req, res));

// Send a live exchange invitation
router.post('/send-live-invitation', [
  body('chatId').isInt().notEmpty().withMessage('Chat ID is required'),
  body('exchangeId').isInt().notEmpty().withMessage('Exchange ID is required')
], (req, res) => req.chatController.sendLiveExchangeInvitation(req, res));

// Get messages for a chat
router.get('/:chatId/messages', (req, res) => req.chatController.getMessages(req, res));

// Get chat by exchange
router.get('/exchange/:exchangeId', (req, res) => req.chatController.getChatByExchange(req, res));

module.exports = router;