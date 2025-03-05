const express = require('express');
const { uploadMedia, getMedia, deleteMedia, updateMedia, searchMedia , downloadMedia } = require('../controllers/mediaController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../utils/fileUpload');


const router = express.Router();

// Upload a media file
router.post('/media', authMiddleware, upload.single('file'), uploadMedia);

// Get all media for a specific folder
router.get('/folders/:folderId/media', authMiddleware, getMedia);

// Update media metadata
router.put('/media/:mediaId', authMiddleware, updateMedia);

// Search media files
router.get('/media/search', authMiddleware, searchMedia);

// Download a media file
router.get('/media/:mediaId/download', authMiddleware, downloadMedia);


// Delete a media file
router.delete('/media/:mediaId', authMiddleware, deleteMedia);

module.exports = router;