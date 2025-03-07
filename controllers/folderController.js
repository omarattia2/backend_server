const { Folder } = require('../models/modelRelations');
const { Sequelize, Op } = require('sequelize');

//------------------------------------------------------------------
// Create a new folder
const createFolder = async (req, res) => {
  const { name, userId: targetUserId } = req.body;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    const folderUserId = (userRole === 'admin' || userRole === 'superadmin') && targetUserId ? targetUserId : userId;

    const newFolder = await Folder.create({ name, userId: folderUserId, sharedWith: [] });

    res.status(201).json({ message: 'Folder created successfully', folder: newFolder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

//------------------------------------------------------------------
// Get all folders for a user
const getFolders = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let folders;
    if (userRole === 'admin' || userRole === 'superadmin') {
      folders = await Folder.findAll();
    } else {
      folders = await Folder.findAll({
        where: {
          [Op.or]: [
            { userId },
            { sharedWith: { [Op.contains]: [userId] } },
          ],
        },
      });
    }

    res.status(200).json({ folders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

//------------------------------------------------------------------
// Share a folder with another user
const shareFolder = async (req, res) => {
  const { folderId } = req.params;
  const { userId: sharedUserId } = req.body;
  const requestingUserId = req.user.id;

  try {
    const folder = await Folder.findOne({ where: { id: folderId } });
    if (!folder) return res.status(404).json({ message: 'Folder not found' });

    if (folder.userId !== requestingUserId) {
      return res.status(403).json({ message: 'You do not have permission to share this folder' });
    }

    if (!folder.sharedWith?.includes(sharedUserId)) {
      folder.sharedWith = [...(folder.sharedWith || []), sharedUserId];
      await folder.save();
    }

    res.status(200).json({ message: 'Folder shared successfully', folder });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

//------------------------------------------------------------------
// Get folders shared with the user
const getSharedFolders = async (req, res) => {
  const requestingUserId = req.user.id;

  try {
    const sharedFolders = await Folder.findAll({
      where: {
        sharedWith: {
          [Op.contains]: [requestingUserId],
        },
      },
    });

    res.status(200).json({ sharedFolders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

//------------------------------------------------------------------
// Unshare a folder for the current user
const unshareFolder = async (req, res) => {
    const { folderId } = req.params;
    const userId = req.user.id;
  
    try {
      // Find the folder
      const folder = await Folder.findOne({ where: { id: folderId } });
      if (!folder) {
        return res.status(404).json({ message: 'Folder not found' });
      }
  
      // Remove the user from the sharedWith array
      if (folder.sharedWith.includes(userId)) {
        folder.sharedWith = folder.sharedWith.filter(id => id !== userId);
        await folder.save();
      }
  
      res.status(200).json({ message: 'Folder unshared successfully', folder });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };

//------------------------------------------------------------------

// Delete a folder
const deleteFolder = async (req, res) => {
    const { folderId } = req.params;
    const userId = req.user.id;
    const userRole = req.user.role;
  
    try {
      // Find the folder
      const folder = await Folder.findOne({ where: { id: folderId } });
      if (!folder) {
        return res.status(404).json({ message: 'Folder not found' });
      }
  
      // Only the folder owner or admins can delete the folder
      if (folder.userId !== userId && userRole !== 'admin' && userRole !== 'superadmin') {
        return res.status(403).json({ message: 'You do not have permission to delete this folder' });
      }
  
      // Delete the folder
      await folder.destroy();
      res.status(200).json({ message: 'Folder deleted successfully' });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };

module.exports = {
  createFolder,
  getFolders,
  deleteFolder,
  shareFolder,
  getSharedFolders,
  unshareFolder,
};



