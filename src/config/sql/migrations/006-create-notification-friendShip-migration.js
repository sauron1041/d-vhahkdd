'use strict';
const STATUS_FRIENDSHIP = require("../../../ultils/types").STATUS_FRIENDSHIP;
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('NotificationFriendShip', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true
            },
            friendShipId: {
                type: Sequelize.INTEGER,
                allowNull: false,
                references: {
                    model: 'FriendShip',
                    key: 'id',
                }
            },
            content: {
                type: Sequelize.STRING,
                allowNull: false,
            },
            status: {
                type: Sequelize.BOOLEAN,
                defaultValue: 0,
            },
            createdAt: {
                type: Sequelize.DATE,
            },
            updatedAt: {
                type: Sequelize.DATE,
            }
        });
    },
    async down(queryInterface, Sequelize) {
        await queryInterface.dropTable('NotificationFriendShip');
    }
};