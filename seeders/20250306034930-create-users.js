'use strict';
const bcrypt = require('bcryptjs');

module.exports = {
  up: async (queryInterface, Sequelize) => {
    // Hash passwords
    const salt = await bcrypt.genSalt(10);
    const hashedPassword1 = await bcrypt.hash('ahmed1', salt);
    const hashedPassword2 = await bcrypt.hash('123', salt);
    const hashedPassword3 = await bcrypt.hash('ibrahem2', salt);
    const hashedPassword4 = await bcrypt.hash('attia1', salt);
    const hashedPassword5 = await bcrypt.hash('salem', salt);
    const hashedPassword6 = await bcrypt.hash('Ammar', salt);
    // Insert users
    await queryInterface.bulkInsert('Users', [
      {
        username: 'ahmed',
        email: 'Ahmed@gmail.com',
        password: hashedPassword1,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'admin1',
        email: 'admin1@example.com',
        password: hashedPassword2,
        role: 'admin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'omar_SuperAdmin',
        email: 'omar_SuperAdmin@example.com',
        password: hashedPassword2,
        role: 'superadmin',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'ibrahem2',
        email: 'ibrahem2@gmail.com',
        password: hashedPassword3,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'attia1',
        email: 'attia1@gmail.com',
        password: hashedPassword4,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'salem',
        email: 'salem@gmail.com',
        password: hashedPassword5,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },
      {
        username: 'Ammar',
        email: 'Ammar@gmail.com',
        password: hashedPassword6,
        role: 'user',
        createdAt: new Date(),
        updatedAt: new Date(),
      },

    ], {});
  },

  down: async (queryInterface, Sequelize) => {
    // Remove all users
    await queryInterface.bulkDelete('Users', null, {});
  },
};