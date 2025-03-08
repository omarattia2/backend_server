const { Media, Folder } = require('../models/modelRelations');
const { Sequelize, Op } = require('sequelize');
const sharp = require('sharp');
const ffmpeg = require('fluent-ffmpeg');
const path = require('path'); // Only one import for 'path'
const fs = require('fs');
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------
const uploadMedia = async (req, res) => {
    const { title, description, type, folderId } = req.body;
    const userId = req.user.id;
  
    try {
      // Check if the folder exists and belongs to the user
      const folder = await Folder.findOne({ where: { id: folderId, userId } });
      if (!folder) {
        // Delete the uploaded file if the folder doesn't exist
        if (req.file) {
          fs.unlinkSync(req.file.path);
        }
        return res.status(404).json({ message: 'Folder not found' });
      }
  
      // Save the file metadata in the database
      const newMedia = await Media.create({
        title,
        description,
        type,
        filePath: req.file.path,
        folderId,
      });
  
      // Generate a thumbnail for images and videos
      let thumbnailPath = null;
      if (type === 'image') {
        // Generate thumbnail for images
        const thumbnailFileName = `thumbnail-${Date.now()}.jpg`;
        thumbnailPath = path.join(__dirname, '../uploads/thumbnails', thumbnailFileName);
  
        await sharp(req.file.path)
          .resize(200, 200) // Resize to 200x200 pixels
          .toFile(thumbnailPath);
  
      } else if (type === 'video') {
        // Generate thumbnail for videos
        const thumbnailFileName = `thumbnail-${Date.now()}.jpg`;
        thumbnailPath = path.join(__dirname, '../uploads/thumbnails', thumbnailFileName);
  
        await new Promise((resolve, reject) => {
          ffmpeg(req.file.path)
            .screenshots({
              timestamps: ['00:00:01'], // Capture a frame at 1 second
              filename: thumbnailFileName,
              folder: path.join(__dirname, '../uploads/thumbnails'),
            })
            .on('end', resolve)
            .on('error', reject);
        });
      }
  
      // Update the media record with the thumbnail path
      if (thumbnailPath) {
        newMedia.thumbnailPath = thumbnailPath;
        await newMedia.save();
      }
  
      res.status(201).json({ message: 'Media uploaded successfully', media: newMedia });
    } catch (err) {
      // Delete the uploaded file if an error occurs
      if (req.file) {
        fs.unlinkSync(req.file.path);
      }
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Update media tags
const updateMediaTags = async (req, res) => {
  const { mediaId } = req.params;
  const { tags } = req.body;
  const userId = req.user.id;

  try {
    // Find the media file
    const media = await Media.findOne({
      where: { id: mediaId },
      include: { model: Folder, where: { userId } }, // Ensure the media belongs to the user
    });

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Convert tags to an array if it's a string
    let tagsArray = [];
    if (typeof tags === 'string') {
      tagsArray = tags.split(',').map(tag => tag.trim()); // Split by comma and trim whitespace
    } else if (Array.isArray(tags)) {
      tagsArray = tags;
    }

    // Update the tags
    media.tags = tagsArray;
    await media.save();

    res.status(200).json({ message: 'Media tags updated successfully', media });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Get all media for a specific folder
const getMedia = async (req, res) => {
  const { folderId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let media;
    if (userRole === 'admin' || userRole === 'superadmin') {
      // Admins can view all media in any folder
      media = await Media.findAll({ where: { folderId } });
    } else {
      // Regular users can only view media in their own folders
      const folder = await Folder.findOne({ where: { id: folderId, userId } });
      if (!folder) {
        return res.status(404).json({ message: 'Folder not found' });
      }
      media = await Media.findAll({ where: { folderId } });
    }

    res.status(200).json({ media });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------




// Search media files

const searchMedia = async (req, res) => {
  const { query, type, startDate, endDate, page = 1, limit = 10 } = req.query;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    // Calculate offset for pagination
    const offset = (page - 1) * limit;

    // Build the search conditions
    const searchConditions = [];
    if (query) {
      searchConditions.push(
        { title: { [Op.iLike]: `%${query}%` } },
        { description: { [Op.iLike]: `%${query}%` } },
        { tags: { [Op.overlap]: [query] } }
      );
    }

    // Build the filter conditions
    const filterConditions = {};
    if (type) {
      filterConditions.type = type;
    }
    if (startDate && endDate) {
      filterConditions.createdAt = {
        [Op.between]: [new Date(startDate), new Date(endDate)],
      };
    } else if (startDate) {
      filterConditions.createdAt = {
        [Op.gte]: new Date(startDate),
      };
    } else if (endDate) {
      filterConditions.createdAt = {
        [Op.lte]: new Date(endDate),
      };
    }

    let media, total;
    if (userRole === 'admin' || userRole === 'superadmin') {
      // Admins can search all media
      media = await Media.findAll({
        where: {
          [Op.and]: [
            searchConditions.length > 0 ? { [Op.or]: searchConditions } : {},
            filterConditions,
          ],
        },
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
      total = await Media.count({
        where: {
          [Op.and]: [
            searchConditions.length > 0 ? { [Op.or]: searchConditions } : {},
            filterConditions,
          ],
        },
      });
    } else {
      // Regular users can only search their own media
      media = await Media.findAll({
        include: {
          model: Folder,
          where: { userId },
        },
        where: {
          [Op.and]: [
            searchConditions.length > 0 ? { [Op.or]: searchConditions } : {},
            filterConditions,
          ],
        },
        limit: parseInt(limit),
        offset: parseInt(offset),
      });
      total = await Media.count({
        include: {
          model: Folder,
          where: { userId },
        },
        where: {
          [Op.and]: [
            searchConditions.length > 0 ? { [Op.or]: searchConditions } : {},
            filterConditions,
          ],
        },
      });
    }

    res.status(200).json({
      media,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        totalPages: Math.ceil(total / limit),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Update media metadata
const updateMedia = async (req, res) => {
  const { mediaId } = req.params;
  const { title, description, type } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let media;
    if (userRole === 'admin' || userRole === 'superadmin') {
      // Admins can update any media file
      media = await Media.findOne({ where: { id: mediaId } });
    } else {
      // Regular users can only update their own media files
      media = await Media.findOne({
        where: { id: mediaId },
        include: { model: Folder, where: { userId } },
      });
    }

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Update the media metadata
    if (title) media.title = title;
    if (description) media.description = description;
    if (type) media.type = type;

    await media.save();

    res.status(200).json({ message: 'Media updated successfully', media });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Delete a media file
const deleteMedia = async (req, res) => {
  const { mediaId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let media;
    if (userRole === 'admin' || userRole === 'superadmin') {
      // Admins can delete any media file
      media = await Media.findOne({ where: { id: mediaId } });
    } else {
      // Regular users can only delete their own media files
      media = await Media.findOne({
        where: { id: mediaId },
        include: { model: Folder, where: { userId } },
      });
    }

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Delete the file from the server
    fs.unlinkSync(media.filePath);

    // Delete the media record from the database
    await media.destroy();

    res.status(200).json({ message: 'Media deleted successfully' });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Download a media file
const downloadMedia = async (req, res) => {
  const { mediaId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let media;
    if ( userRole !== 'superadmin') {
      // Admins can download any media file
      media = await Media.findOne({ where: { id: mediaId } });
    } else {
      // Regular users can only download their own media files
      media = await Media.findOne({
        where: { id: mediaId },
        include: { model: Folder, where: { userId } },
      });
    }

    if (!media) {
      return res.status(404).json({ message: 'Media not found' });
    }

    // Send the file for download
    res.download(media.filePath);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  uploadMedia,
  getMedia,
  searchMedia,
  updateMedia,
  deleteMedia,
  downloadMedia,
  updateMediaTags,
};