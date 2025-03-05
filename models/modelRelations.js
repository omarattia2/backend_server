const User = require('./userModel');
const Folder = require('./folderModel');
const Media = require('./mediaModel');

// Relationships
User.hasMany(Folder, { foreignKey: 'userId' });
Folder.belongsTo(User, { foreignKey: 'userId' });

Folder.hasMany(Media, { foreignKey: 'folderId' });
Media.belongsTo(Folder, { foreignKey: 'folderId' });

module.exports = {
  User,
  Folder,
  Media,
};