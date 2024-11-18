const mongoose = require('mongoose')
const { Schema } = mongoose

const ViewHistorySchema = Schema(
  {
    bookId: {
      type: Schema.Types.ObjectId,
      ref: 'Book',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: () => new Date().setHours(0, 0, 0, 0),
    },
    views: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
)

ViewHistorySchema.index({ bookId: 1, date: 1 })

const ViewHistory = mongoose.model('ViewHistory', ViewHistorySchema)

module.exports = ViewHistory
