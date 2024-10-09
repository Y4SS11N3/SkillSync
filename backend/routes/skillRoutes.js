const express = require('express');
const router = express.Router();
const skillController = require('../controllers/skillController');
const authMiddleware = require('../middlewares/authMiddleware');

router.use(authMiddleware);

router.get('/trends', skillController.getSkillTrends);
router.get('/trending', skillController.getTrendingSkills);
router.get('/list', skillController.listSkills);
router.get('/user-skills', skillController.getUserSkills);
router.post('/user-skills', skillController.addUserSkill);

router.post('/', skillController.createSkill);
router.get('/:skillId', skillController.getSkill);
router.put('/:skillId', skillController.updateSkill);
router.delete('/:skillId', skillController.deleteSkill);
router.get('/:skillId/token', skillController.getSkillTokenInfo);
router.get('/:skillId/related', skillController.getRelatedSkills);
router.get('/:skillId/statistics', skillController.getSkillStatistics);
router.delete('/user-skills/:skillId', skillController.deleteUserSkill);

module.exports = router;