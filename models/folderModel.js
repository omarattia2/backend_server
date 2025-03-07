const { DataTypes } = require('sequelize');
const sequelize = require('../config/dbConfig');

const Folder = sequelize.define('Folder', {
  id: {
    type: DataTypes.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  },
  name: {
    type: DataTypes.STRING,
    allowNull: false,
  },
  userId: {
    type: DataTypes.INTEGER,
    allowNull: false,
  },
  sharedWith: {
    type: DataTypes.ARRAY(DataTypes.INTEGER), // Array of user IDs
    defaultValue: [],
  },
});

module.exports = Folder;