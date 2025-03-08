const express = require('express');
const { uploadMedia, getMedia, deleteMedia, updateMedia, searchMedia , downloadMedia, updateMediaTags } = require('../controllers/mediaController');
const authMiddleware = require('../middleware/authMiddleware');
const upload = require('../utils/fileUpload');
const activityLogger = require('../middleware/activityLogger');


const router = express.Router();

// Upload a media file
router.post('/media', authMiddleware, upload.single('file'), uploadMedia);

// Get all media for a specific folder
router.get('/folders/:folderId/media', authMiddleware, (req, res, next) => {
    // Add pagination query parameters
    req.query.page = req.query.page || 1;
    req.query.limit = req.query.limit || 10;
    next();
  }, getMedia);

// Update media metadata
router.put('/media/:mediaId', authMiddleware, updateMedia);

// Search media files
router.get('/media/search', authMiddleware, searchMedia);

// Download a media file
router.get('/media/:mediaId/download', authMiddleware, downloadMedia);

// Update media tags
router.put('/media/:mediaId/tags', authMiddleware, updateMediaTags);

// Delete a media file
router.delete('/media/:mediaId', authMiddleware, deleteMedia);


router.post('/media', authMiddleware, activityLogger, upload.single('file'), uploadMedia);
router.put('/media/:mediaId', authMiddleware, activityLogger, updateMedia);
router.delete('/media/:mediaId', authMiddleware, activityLogger, deleteMedia);

module.exports = router;