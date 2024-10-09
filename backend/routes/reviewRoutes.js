const express = require('express');
const router = express.Router();
const reviewController = require('../controllers/reviewController');
const { validateCreateReview, validateGetReviews } = require('../middlewares/validationMiddleware');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.post('/create', validateCreateReview, reviewController.createReview);
router.get('/user', validateGetReviews, reviewController.getReviewsForUser);

module.exports = router;