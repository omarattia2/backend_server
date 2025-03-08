const express = require('express');
const { getStatistics } = require('../controllers/adminDashboardController');
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Admin dashboard routes
router.get('/admin/dashboard', authMiddleware, adminMiddleware, getStatistics );

module.exports = router;