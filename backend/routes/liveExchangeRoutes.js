const express = require('express');
const router = express.Router();
const { body, param } = require('express-validator');
const authMiddleware = require('../middlewares/authMiddleware');
const LiveExchangeController = require('../controllers/liveExchangeController');

router.use(authMiddleware);

const initLiveExchangeController = (req, res, next) => {
  req.liveExchangeController = new LiveExchangeController(req.io);
  next();
};

router.use(initLiveExchangeController);

// Initialize a live exchange session (Initiator only)
router.post('/initialize', [
  body('exchangeId').isInt().notEmpty().withMessage('Exchange ID is required')
], (req, res) => req.liveExchangeController.initializeSession(req, res));

// Verify session token
router.get('/verify/:sessionId/:token', (req, res) => req.liveExchangeController.verifySessionToken(req, res));

router.post('/:sessionId/join', [
  param('sessionId').isInt().notEmpty().withMessage('Session ID is required'),
  body('token').isString().notEmpty().withMessage('Token is required')
], (req, res) => {

  
  if (!req.socketId) {
    req.socketId = 'http-request';
  }
  
  // Pass req.user.id as the userId
  if (req.user && req.user.id) {
    req.liveExchangeController.joinSession(req, res, req.user.id);
  } else {
    console.error('[liveExchangeRoutes] req.user or req.user.id is undefined');
    res.status(400).json({ error: 'User not authenticated' });
  }
});


// End a live exchange session (Both Initiator and Provider)
router.post('/:sessionId/end', [
  param('sessionId').isInt().notEmpty().withMessage('Session ID is required')
], (req, res) => req.liveExchangeController.endSession(req, res));

// Toggle audio in a live exchange session (Both Initiator and Provider)
router.post('/:sessionId/toggle-audio', [
  param('sessionId').isInt().notEmpty().withMessage('Session ID is required'),
  body('isAudioEnabled').isBoolean().withMessage('isAudioEnabled must be a boolean')
], (req, res) => req.liveExchangeController.toggleAudio(req, res));

router.post('/:sessionId/sync-editor', [
  param('sessionId').isInt().notEmpty().withMessage('Session ID is required'),
  body('operation').isString().notEmpty().withMessage('Operation is required'),
  body('data').notEmpty().withMessage('Data is required')
], (req, res) => req.liveExchangeController.handleSyncEditorOperation(req, res));

router.post('/:sessionId/log-chat', [
  param('sessionId').isInt().notEmpty().withMessage('Session ID is required'),
  body('messageType').isString().notEmpty().withMessage('Message type is required')
], (req, res) => req.liveExchangeController.logChatActivity(req, res));

// Send a live exchange invitation (Initiator only)
router.post('/send-invitation', [
  body('exchangeId').isInt().notEmpty().withMessage('Exchange ID is required'),
  body('receiverId').isInt().notEmpty().withMessage('Receiver ID is required')
], (req, res) => req.liveExchangeController.sendLiveExchangeInvitation(req, res));

// Accept a live exchange invitation (Provider only)
router.post('/accept-invitation/:invitationId', [
  param('invitationId').isInt().notEmpty().withMessage('Invitation ID is required')
], (req, res) => req.liveExchangeController.acceptLiveExchangeInvitation(req, res));

// Decline a live exchange invitation (Provider only)
router.post('/decline-invitation/:invitationId', [
  param('invitationId').isInt().notEmpty().withMessage('Invitation ID is required')
], (req, res) => req.liveExchangeController.declineLiveExchangeInvitation(req, res));


router.post('/:sessionId/toggle-video', [
  param('sessionId').isInt().notEmpty().withMessage('Session ID is required'),
  body('isVideoEnabled').isBoolean().withMessage('isVideoEnabled must be a boolean')
], (req, res) => req.liveExchangeController.toggleVideo(req, res));

router.post('/:sessionId/start-screen-share', [
  param('sessionId').isInt().notEmpty().withMessage('Session ID is required')
], (req, res) => req.liveExchangeController.startScreenShare(req, res));

router.post('/:sessionId/stop-screen-share', [
  param('sessionId').isInt().notEmpty().withMessage('Session ID is required')
], (req, res) => req.liveExchangeController.stopScreenShare(req, res));

router.get('/:sessionId', [
  param('sessionId').isInt().notEmpty().withMessage('Session ID is required')
], (req, res) => req.liveExchangeController.getSessionDetails(req, res));

module.exports = router;