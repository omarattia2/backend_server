const express = require('express');
const { registerUser, loginUser ,updateProfile ,promoteToAdmin, getAllUsers ,demoteFromAdmin ,uploadProfilePicture, changePassword, deleteUser  } = require('../controllers/authController');
const authMiddleware = require('../middleware/authMiddleware');
const profileUpload = require('../utils/profileUpload'); 
const activityLogger = require('../middleware/activityLogger');
const { validateUserRegistration } = require('../middleware/validators');
const router = express.Router();

// Register route with validation
router.post('/register', validateUserRegistration, registerUser);

// Login route
router.post('/login', loginUser);

// Update Profile route
router.put('/profile', authMiddleware, updateProfile);

// Change password
router.put('/change-password', authMiddleware, changePassword);


// Upload profile picture
router.put('/profile-picture', authMiddleware, profileUpload.single('profilePicture'), uploadProfilePicture);

// Delete user account
router.delete('/users/:userId', authMiddleware, deleteUser);

// Get all users (admin only)
router.get('/users', authMiddleware, getAllUsers);
// Promote a user to admin
router.put('/promote/:userId', authMiddleware, promoteToAdmin);
// Demote a user from admin to regular user
router.put('/demote/:userId', authMiddleware, demoteFromAdmin);

// Register route with validation and activity logging
router.post('/register', validateUserRegistration, activityLogger, registerUser);

// Login route with activity logging
router.post('/login', activityLogger, loginUser);


// Protected route
router.get('/protected', authMiddleware, (req, res) => {
  res.json({ message: 'This is a protected route', user: req.user });
});

module.exports = router;