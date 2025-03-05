const { Folder, User } = require('../models/modelRelations');
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Create a new folder
const createFolder = async (req, res) => {
    const { name, userId: targetUserId } = req.body; // Allow specifying a target user ID
    const userId = req.user.id; // ID of the admin/superadmin making the request
    const userRole = req.user.role;
  
    try {
      // If the user is an admin/superadmin and a targetUserId is provided, use it
      const folderUserId = (userRole === 'admin' || userRole === 'superadmin') && targetUserId ? targetUserId : userId;
  
      // Create the folder
      const newFolder = await Folder.create({ name, userId: folderUserId });
  
      res.status(201).json({ message: 'Folder created successfully', folder: newFolder });
    } catch (err) {
      console.error(err);
      res.status(500).json({ message: 'Server error' });
    }
  };
//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------

// Get all folders
const getFolders = async (req, res) => {
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let folders;
    if (userRole === 'admin' || userRole === 'superadmin') {
      // Admins can view all folders
      folders = await Folder.findAll();
    } else {
      // Regular users can only view their own folders
      folders = await Folder.findAll({ where: { userId } });
    }

    res.status(200).json({ folders });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

//--------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------


// Delete a folder
const deleteFolder = async (req, res) => {
  const { folderId } = req.params;
  const userId = req.user.id;
  const userRole = req.user.role;

  try {
    let folder;
    if (userRole === 'admin' || userRole === 'superadmin') {
      // Admins can delete any folder
      folder = await Folder.findOne({ where: { id: folderId } });
    } else {
      // Regular users can only delete their own folders
      folder = await Folder.findOne({ where: { id: folderId, userId } });
    }

    if (!folder) {
      return res.status(404).json({ message: 'Folder not found' });
    }

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
};