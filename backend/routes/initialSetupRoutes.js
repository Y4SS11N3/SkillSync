const express = require('express');
const router = express.Router();
const initialSetupController = require('../controllers/initialSetupController');
const authMiddleware = require('../middlewares/authMiddleware');

router.post('/submit-initial-skills', authMiddleware, initialSetupController.submitInitialSkills);

module.exports = router;