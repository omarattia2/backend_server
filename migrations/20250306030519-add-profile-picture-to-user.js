'use strict';

module.exports = {
  up: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('Users');
    if (!tableDefinition.profilePicture) {
      await queryInterface.addColumn('Users', 'profilePicture', {
        type: Sequelize.STRING,
        allowNull: true,
      });
    }
  },

  down: async (queryInterface, Sequelize) => {
    const tableDefinition = await queryInterface.describeTable('Users');
    if (tableDefinition.profilePicture) {
      await queryInterface.removeColumn('Users', 'profilePicture');
    }
  },

  
};