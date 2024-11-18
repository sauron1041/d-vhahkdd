const mongoose = require('mongoose')
const { Schema } = mongoose

const ReadTimeSchema = Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    date: {
      type: Date,
      required: true,
      default: () => new Date().setHours(0, 0, 0, 0),
    },
    totalReadTime: Number,
    detail: [
      {
        bookId: {
          type: Schema.Types.ObjectId,
          ref: 'Book',
        },
        readTime: Number,
      },
    ],
  },
  {
    timestamps: true,
  }
)

ReadTimeSchema.index({ bookId: 1, date: 1 })

const ReadTime = mongoose.model('ReadTime', ReadTimeSchema)

module.exports = ReadTime
