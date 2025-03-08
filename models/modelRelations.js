const User = require('./userModel');
const Folder = require('./folderModel');
const Media = require('./mediaModel');
const ActivityLog = require('./activityLogModel');

// Relationships
User.hasMany(Folder, { foreignKey: 'userId' });
Folder.belongsTo(User, { foreignKey: 'userId' });

Folder.hasMany(Media, { foreignKey: 'folderId' });
Media.belongsTo(Folder, { foreignKey: 'folderId' });

// User has many ActivityLogs
User.hasMany(ActivityLog, { foreignKey: 'userId' });
ActivityLog.belongsTo(User, { foreignKey: 'userId' });

module.exports = {
  User,
  Folder,
  Media,
  ActivityLog,

};
