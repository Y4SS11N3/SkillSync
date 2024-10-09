const { body, query, validationResult } = require('express-validator');

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    return res.status(400).json({ errors: errors.array() });
  }
  next();
};

exports.validateGetMatches = [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  query('minSkillLevel').optional().isInt({ min: 1, max: 10 }),
  query('maxDistance').optional().isFloat({ min: 0 }),
  handleValidationErrors
];

exports.validateSuggestSkillCircles = [
  body('userIds').isArray().withMessage('userIds must be an array'),
  body('userIds.*').isInt().withMessage('All userIds must be integers'),
  query('maxSize').optional().isInt({ min: 2, max: 10 }),
  handleValidationErrors
];

exports.validateSkillHeatMap = [
  query('skill').notEmpty().withMessage('Skill name is required'),
  query('radius').isFloat({ min: 0 }).withMessage('Radius must be a positive number'),
  handleValidationErrors
];

exports.validateRareSkills = [
  query('limit').optional().isInt({ min: 1, max: 100 }),
  handleValidationErrors
];

exports.validatePeriod = [
  query('period').optional().isIn(['week', 'month', 'year']).withMessage('Invalid period'),
  handleValidationErrors
];

exports.validateCreateReview = [
  body('exchangeId').isInt().withMessage('Exchange ID must be an integer'),
  body('rating').isFloat({ min: 1, max: 5 }).withMessage('Rating must be between 1 and 5'),
  body('comment').isString().optional().isLength({ max: 1000 }).withMessage('Comment must be a string with maximum 1000 characters'),
  handleValidationErrors
];

exports.validateGetReviews = [
  query('userId').isInt().withMessage('User ID must be an integer'),
  handleValidationErrors
];

exports.validateExchangeStatus = [
  body('action').isIn(['accept', 'decline']).withMessage('Action must be either accept or decline'),
  handleValidationErrors
];