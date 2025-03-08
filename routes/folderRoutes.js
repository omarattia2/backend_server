const express = require('express');
const { createFolder, getFolders, deleteFolder, shareFolder, getSharedFolders , unshareFolder } = require('../controllers/folderController');
const authMiddleware = require('../middleware/authMiddleware');
const activityLogger = require('../middleware/activityLogger');

const router = express.Router();

// Create a folder
router.post('/folders', authMiddleware, createFolder);

// Get all folders for the authenticated user
router.get('/folders', authMiddleware, getFolders);

// Share a folder with another user
router.post('/folders/:folderId/share', authMiddleware, shareFolder);

// Get shared folders
router.get('/folders/shared', authMiddleware, getSharedFolders);

// Delete a folder
router.delete('/folders/:folderId', authMiddleware, deleteFolder);

// Unshare a folder for the current user
router.delete('/folders/:folderId/unshare', authMiddleware, unshareFolder);

router.post('/folders', authMiddleware, activityLogger, createFolder);
router.delete('/folders/:folderId', authMiddleware, activityLogger, deleteFolder);

module.exports = router;