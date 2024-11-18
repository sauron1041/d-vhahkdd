'use strict';
const {
    Model
} = require('sequelize');
module.exports = (sequelize, DataTypes) => {
    class ProfileContact extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here
            ProfileContact.belongsTo(models.User, { foreignKey: 'userId', });
        }
    }
    ProfileContact.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
        },
        birthdate: DataTypes.DATE,
        gender: DataTypes.BOOLEAN,
        soundTrack: DataTypes.STRING,
        coverImage: DataTypes.STRING,
        description: DataTypes.STRING,
        userId: {
            type: DataTypes.INTEGER,
            unique: true,
            references: {
                model: 'User',
                key: 'id'
            }
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'ProfileContact',
    });
    return ProfileContact;
};