const mongoose = require('mongoose')
const { Schema } = mongoose

const RequestAmountModel = Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    amount: Number,
    description: String,
    date: Date,
    bankConfigId: {
      type: Schema.Types.ObjectId,
      ref: 'BankAccount',
    },
    status: {
      type: String,
      default: 'PENDING',
      enum: ['PENDING', 'APPROVED', 'REJECTED'],
    },
  },
  {
    timestamps: true,
  }
)

const RequestAmount = mongoose.model('RequestAmount', RequestAmountModel)

module.exports = RequestAmount
