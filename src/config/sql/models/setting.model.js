'use strict';
import {
    Model
} from 'sequelize';
module.exports = (sequelize, DataTypes) => {
    class Setting extends Model {
        /**
         * Helper method for defining associations.
         * This method is not a part of Sequelize lifecycle.
         * The `models/index` file will call this method automatically.
         */
        static associate(models) {
            // define association here 
            Setting.belongsTo(models.User, {
                foreignKey: 'id',
                as: 'setting',
            });


        }
    }
    Setting.init({
        id: {
            type: DataTypes.INTEGER,
            primaryKey: true,
            allowNull: false,
            autoIncrement: true,
            references: {
                model: 'User',
                key: 'id'
            }
        },
        onlyDisplayOnline: {
            type: DataTypes.BOOLEAN,
            defaultValue: false
        },
        showDate: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        showStatusOnline: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        showSeen: {
            type: DataTypes.BOOLEAN,
            defaultValue: true
        },
        allowSendMessage: {
            type: DataTypes.STRING,
            defaultValue: true
        },
        allowCall: {
            type: DataTypes.STRING,
            defaultValue: true
        },
        addFriendByQR: {
            type: DataTypes.STRING,
            defaultValue: true
        },
        addFriendByGroup: {
            type: DataTypes.STRING,
            defaultValue: true
        },
        addFriendByCard: {
            type: DataTypes.STRING,
            defaultValue: true
        },
        createdAt: DataTypes.DATE,
        updatedAt: DataTypes.DATE,
    }, {
        sequelize,
        modelName: 'Setting',
    });
    return Setting;
};