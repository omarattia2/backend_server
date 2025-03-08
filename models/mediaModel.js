const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Media = sequelize.define('Media', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  title: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  description: {
    type: DataTypes.TEXT,
  },
  type: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  filePath: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  thumbnailPath: {
    type: DataTypes.STRING, // Path to the thumbnail
    allowNull: true,
  },
  folderId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },

  tags: {
    type: DataTypes.ARRAY(DataTypes.STRING), // Array of tags
    defaultValue: [],
  },
  
});

module.exports = Media;