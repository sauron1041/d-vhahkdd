'use strict';
import {
  Model
} from 'sequelize';
module.exports = (sequelize, DataTypes) => {
  class User extends Model {
    /**
     * Helper method for defining associations.
     * This method is not a part of Sequelize lifecycle.
     * The `models/index` file will call this method automatically.
     */
    static associate(models) {
      // define association here 
      User.hasOne(models.ProfileContact, { as: 'userInfo', foreignKey: 'userId' })

      User.belongsToMany(models.User, {
        as: 'friends',
        through: 'FriendShip',
        foreignKey: 'user1Id', // Khóa ngoại của user trong bảng FriendShip
        otherKey: 'user2Id' // Khóa ngoại của user đích trong bảng FriendShip
      });

      User.hasMany(models.Post, {
        foreignKey: 'userId'
      });

      User.hasMany(models.Comment, {
        foreignKey: 'userId'
      });


    }
  }
  User.init({
    id: {
      type: DataTypes.INTEGER,
      primaryKey: true,
      allowNull: false,
      autoIncrement: true
    },
    userName: DataTypes.STRING,
    phoneNumber: {
      type: DataTypes.STRING,
      unique: true,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    avatar: DataTypes.BLOB('long'),
    lastedOnline: {
      type: DataTypes.DATE,
      allowNull: true,
    },
    code: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    refresh_token: DataTypes.STRING,
    peerId: DataTypes.STRING,
    email: {
      type: DataTypes.STRING,
      allowNull: true,
    },
    emailActive: {
      type: DataTypes.BOOLEAN,
      defaultValue: false
    },
    createdAt: DataTypes.DATE,
    updatedAt: DataTypes.DATE,
  }, {
    sequelize,
    modelName: 'User',
  });
  return User;
};