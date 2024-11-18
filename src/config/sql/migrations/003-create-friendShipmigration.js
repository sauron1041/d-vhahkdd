'use strict';
const STATUS_FRIENDSHIP = require("../../../ultils/types").STATUS_FRIENDSHIP;
/** @type {import('sequelize-cli').Migration} */
module.exports = {
    async up(queryInterface, Sequelize) {
        await queryInterface.createTable('FriendShip', {
            id: {
                allowNull: false,
                primaryKey: true,
                type: Sequelize.INTEGER,
                autoIncrement: true
            },
            user1Id: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'User',
                    key: 'id'
                }
            },
            user2Id: {
                allowNull: false,
                type: Sequelize.INTEGER,
                references: {
                    model: 'User',
                    key: 'id'
                }
            },
            status: {
                type: Sequelize.STRING,
                allowNull: false,
                defaultValue: STATUS_FRIENDSHIP.PENDING,
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
        await queryInterface.dropTable('FriendShip');
    }
};