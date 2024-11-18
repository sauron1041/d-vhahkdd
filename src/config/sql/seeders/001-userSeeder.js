'use strict';
/** @type {import('sequelize-cli').Migration} */
const { random_bg_color } = require('../../../ultils/random');

module.exports = {
  async up(queryInterface, Sequelize) {
    /**
     * Add seed commands here.
     *
     * Example:
     * await queryInterface.bulkInsert('People', [{
     *   name: 'John Doe',
     *   isBetaMember: false
     * }], {});
    */
    return queryInterface.bulkInsert('User', [
      {
        userName: 'Hồng Sơn Nguyễn',
        phoneNumber: '0935201508',
        password: '$2b$10$N9x0b4NSvFDunLRsV7zAgejqFN93IV8l.GvRHuwh9t7/e8d2Wy4jy',
        avatar: Buffer.from(random_bg_color(), "utf-8")
      },
      {
        userName: 'Phạm Văn Khoa',
        phoneNumber: '0339331841',
        password: '$2b$10$N9x0b4NSvFDunLRsV7zAgejqFN93IV8l.GvRHuwh9t7/e8d2Wy4jy',
        avatar: Buffer.from(random_bg_color(), "utf-8")
      },
      {
        userName: 'Lưu Trung Nghĩa',
        phoneNumber: '0815950975',
        password: '$2b$10$N9x0b4NSvFDunLRsV7zAgejqFN93IV8l.GvRHuwh9t7/e8d2Wy4jy',
        avatar: Buffer.from(random_bg_color(), "utf-8")
      },
      {
        userName: 'Ngô Nhật Thái',
        phoneNumber: '0961306963',
        password: '$2b$10$N9x0b4NSvFDunLRsV7zAgejqFN93IV8l.GvRHuwh9t7/e8d2Wy4jy',
        avatar: Buffer.from(random_bg_color(), "utf-8")
      },
    ]);
  },

  async down(queryInterface, Sequelize) {
    /**
     * Add commands to revert seed here.
     *
     * Example:
     * await queryInterface.bulkDelete('People', null, {});
     */
  }
};
