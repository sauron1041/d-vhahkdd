const mongoose = require('mongoose')
const { Schema } = mongoose

const BankAccountModel = Schema(
  {
    bankId: String,
    bankName: String,
    accountNumber: String,
    accountName: String,
  },
  {
    timestamps: true,
  }
)

const BankAccount = mongoose.model('BankAccount', BankAccountModel)

module.exports = BankAccount
