const { body, validationResult } = require('express-validator');

// Validation and sanitization rules for user registration
const validateUserRegistration = [
  body('username')
    .notEmpty().withMessage('Username is required')
    .trim()
    .escape(),
  body('email')
    .isEmail().withMessage('Invalid email address')
    .normalizeEmail(),
  body('password')
    .isLength({ min: 6 }).withMessage('Password must be at least 6 characters long')
    .trim()
    .escape(),
];

module.exports = {
  validateUserRegistration,
};