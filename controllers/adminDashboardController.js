const { User, Media, Folder, ActivityLog } = require('../models/modelRelations');

// Get system statistics
const getStatistics = async (req, res) => {
  try {
    const totalUsers = await User.count();
    const totalMedia = await Media.count();
    const totalFolders = await Folder.count();
    const recentActivity = await ActivityLog.findAll({
      order: [['createdAt', 'DESC']],
      limit: 10,
      include: [{ model: User, attributes: ['username'] }],
    });

    res.status(200).json({
      totalUsers,
      totalMedia,
      totalFolders,
      recentActivity,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

module.exports = {
  getStatistics,
};