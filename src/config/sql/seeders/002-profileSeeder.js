'use strict';

/** @type {import('sequelize-cli').Migration} */
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
        return queryInterface.bulkInsert('ProfileContact', [
            {
                birthdate: new Date('2003-10-03'),
                gender: 0,
                soundTrack: '',
                coverImage: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/hsn-bg.jpg',
                description: 'Xem cái gì, chẳng có gì ở đây cả',
                userId: 1,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                birthdate: new Date('2002-07-15'),
                gender: 0,
                soundTrack: '',
                coverImage: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/pvk-bg.jpg',
                description: 'Tôi học Khoa học máy tính nhưng tôi cuồng Khoa học dữ liệu :)',
                userId: 2,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                birthdate: new Date('2002-01-10'),
                gender: 0,
                soundTrack: '',
                coverImage: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/ltn-bg.jpg',
                description: 'Tôi là dân IT nhưng tôi thích đi đá bóng :)',
                userId: 3,
                createdAt: new Date(),
                updatedAt: new Date()
            },
            {
                birthdate: new Date('2002-05-09'),
                gender: 0,
                soundTrack: '',
                coverImage: 'https://raw.githubusercontent.com/hongson1003/Zalo_Images/main/ntt-bg.jpg',
                description: 'ix.i💕Haxing',
                userId: 4,
                createdAt: new Date(),
                updatedAt: new Date()
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
