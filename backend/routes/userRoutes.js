const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const upload = require('../middlewares/uploadMiddleware');

router.use(authMiddleware);

router.get('/profile', userController.getUserProfile);
router.put('/profile', userController.updateUserProfile);
router.delete('/profile', userController.deleteUserProfile);
router.get('/skills', userController.getUserSkills);
router.get('/:userId/skills', userController.getUserSkills);
router.post('/skills', userController.addUserSkill);
router.put('/skills/:skillId', userController.updateUserSkill);
router.delete('/skills/:skillId', userController.deleteUserSkill);
router.get('/reputation', userController.getReputationScore);
router.get('/time-credits', userController.getTimeCredits);
router.get('/skill-tokens', userController.getSkillTokens);
router.post('/avatar', upload.single('avatar'), userController.updateUserAvatar);
router.delete('/avatar', userController.deleteUserAvatar);
router.get('/avatar/:userId?', userController.getUserAvatar);
router.get('/:userId/known-skills', userController.getUserKnownSkills);
router.get('/:userId/interested-skills', userController.getUserInterestedSkills);

module.exports = router;