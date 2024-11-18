'use strict'
/** @type {import('sequelize-cli').Migration} */
module.exports = {
  async up(queryInterface, Sequelize) {
    await queryInterface.createTable('Setting', {
      id: {
        allowNull: false,
        autoIncrement: true,
        primaryKey: true,
        type: Sequelize.INTEGER,
        references: {
          model: 'User',
          key: 'id',
        },
      },
      onlyDisplayOnline: {
        type: Sequelize.BOOLEAN,
        defaultValue: false,
      },
      showDate: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      showStatusOnline: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      showSeen: {
        type: Sequelize.BOOLEAN,
        defaultValue: true,
      },
      allowSendMessage: {
        type: Sequelize.STRING,
        defaultValue: true,
      },
      allowCall: {
        type: Sequelize.STRING,
        defaultValue: true,
      },
      addFriendByQR: {
        type: Sequelize.STRING,
        defaultValue: true,
      },
      addFriendByGroup: {
        type: Sequelize.STRING,
        defaultValue: true,
      },
      addFriendByCard: {
        type: Sequelize.STRING,
        defaultValue: true,
      },

      createdAt: {
        type: Sequelize.DATE,
      },
      updatedAt: {
        type: Sequelize.DATE,
      },
    })
  },
  async down(queryInterface, Sequelize) {
    await queryInterface.dropTable('Setting')
  },
}
