const express = require('express');
const router = express.Router();
const exchangeController = require('../controllers/exchangeController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

// Define routes
router.post('/request', exchangeController.createExchangeRequest);
router.get('/analytics', exchangeController.getExchangeAnalytics);
router.post('/connect', exchangeController.connectForExchange);
router.get('/advanced-search', exchangeController.advancedSkillSearch);
router.delete('/review/:reviewId', exchangeController.deleteReview);
router.get('/', exchangeController.listExchanges);
router.get('/:exchangeId', exchangeController.getExchange);
router.post('/:exchangeId/respond', exchangeController.respondToExchangeRequest);
router.post('/:exchangeId/cancel', exchangeController.cancelExchange);
router.post('/:exchangeId/complete', exchangeController.completeExchange);
router.post('/:exchangeId/review', exchangeController.createReview);
router.get('/user/:userId/reviews', exchangeController.getReviewsForUser);
router.get('/:exchangeId/reviews', exchangeController.getReviewsForExchange);
router.put('/review/:reviewId', exchangeController.updateReview);

module.exports = router;