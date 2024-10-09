const express = require('express');
const router = express.Router();
const dashboardController = require('../controllers/dashboardController');
const reviewRoutes = require('./reviewRoutes');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/dashboard', dashboardController.getDashboardData);
router.get('/skills/user', dashboardController.getUserSkills);
router.get('/exchanges/history', dashboardController.getExchangeHistory);
router.get('/reputation', dashboardController.getUserReputation);
router.use('/reviews', reviewRoutes);
router.get('/skill-matches', dashboardController.getSkillMatches);
router.get('/upcoming-exchanges', dashboardController.getUpcomingExchanges);
router.get('/achievements', dashboardController.getAchievements);
router.get('/learning-goals', dashboardController.getLearningGoals);
router.post('/learning-goals/add', dashboardController.addToLearningGoals);
router.get('/personalized-recommendations', dashboardController.getPersonalizedRecommendations);

module.exports = router;