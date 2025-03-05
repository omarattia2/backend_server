const express = require('express');
const { getFolders, deleteFolder } = require('../controllers/folderController'); // Import from folderController
const { getMedia, deleteMedia } = require('../controllers/mediaController'); // Import from mediaController
const authMiddleware = require('../middleware/authMiddleware');
const adminMiddleware = require('../middleware/adminMiddleware');

const router = express.Router();

// Admin-only routes
router.get('/admin/folders', authMiddleware, adminMiddleware, getFolders);
router.delete('/admin/folders/:folderId', authMiddleware, adminMiddleware, deleteFolder);
router.get('/admin/folders/:folderId/media', authMiddleware, adminMiddleware, getMedia); // Use getMedia from mediaController
router.delete('/admin/media/:mediaId', authMiddleware, adminMiddleware, deleteMedia); // Use deleteMedia from mediaController

module.exports = router;