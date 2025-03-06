const { Media, Folder } = require('../models/modelRelations');
const { Op } = require('sequelize');
const path = require('path');
const fs = require('fs');

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Upload a media file
const uploadMedia = async (req, res) => {
  const { title, description, type, folderId } = req.body;
  const userId = req.user.id; // Get the user ID from the authenticated request

  try {
    // Check if the folder exists and belongs to the user
    const folder = await Folder.findOne({ where: { id: folderId, userId } });
    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

    // Save the file metadata in the database
    const newMedia = await Media.create({
      title,
      description,
      type,
      filePath: req.file.path, // Path to the uploaded file
      folderId,
    });

    res.status(201).json({ message: 'Media uploaded successfully', media: newMedia });
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
  const { query } = req.query; // Search query
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let media;
    if (userRole === 'admin'  || userRole === 'superadmin') {
      // Admins can search all media
      media = await Media.findAll({
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: `%${query}%` } }, // Case-insensitive search for title
            { description: { [Op.iLike]: `%${query}%` } }, // Case-insensitive search for description
            { type: { [Op.iLike]: `%${query}%` } }, // Case-insensitive search for type
          ],
        },
      });
    } else {
      // Regular users can only search their own media
      media = await Media.findAll({
        include: {
          model: Folder,
          where: { userId }, // Ensure the media belongs to the user
        },
        where: {
          [Op.or]: [
            { title: { [Op.iLike]: `%${query}%` } },
            { description: { [Op.iLike]: `%${query}%` } },
            { type: { [Op.iLike]: `%${query}%` } },
          ],
        },
      });
    }

    res.status(200).json({ media });
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
};