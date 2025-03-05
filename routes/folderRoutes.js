const express = require('express');
const { createFolder, getFolders, deleteFolder } = require('../controllers/folderController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

// Create a folder
router.post('/folders', authMiddleware, createFolder);

// Get all folders for the authenticated user
router.get('/folders', authMiddleware, getFolders);

// Delete a folder
router.delete('/folders/:folderId', authMiddleware, deleteFolder);

module.exports = router;