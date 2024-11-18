const mongoose = require('mongoose')
const { Schema } = mongoose

const UserModel = Schema(
  {
    userName: {
      type: String,
      required: true,
    },
    avatar: String,
    studentCode: {
      type: Number,
      unique: true,
      required: true,
    },
    birthDate: Date,
    email: String,
    password: {
      type: String,
      required: true,
    },
    phone: String,
    majorId: Schema.Types.ObjectId,
    memberShip: {
      type: String,
      default: 'NORMAL',
      enum: ['NORMAL', 'VIP'],
    },
    totalSpend: Number,
    refresh_token: String,
    access_token: String,
    amount: {
      type: Schema.Types.ObjectId,
      ref: 'Amount',
    },
    historyId: {
      type: Schema.Types.ObjectId,
      ref: 'History',
    },
    status: {
      type: String,
      default: 'ACTIVE',
      enum: ['ACTIVE', 'INACTIVE'],
    },
  },
  {
    timestamps: true,
  }
)

const User = mongoose.model('User', UserModel)

module.exports = User
