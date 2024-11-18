const mongoose = require('mongoose')
const { Schema } = mongoose

const HistoryModel = Schema(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    books: [
      {
        bookId: { type: Schema.Types.ObjectId, ref: 'Book', index: true },
        lastReadChapterId: Schema.Types.ObjectId,
        lastReadAt: { type: Date, default: Date.now },
      },
    ],
    lastReadBook: { type: Schema.Types.ObjectId, ref: 'Book', index: true },
    like: [{ type: Schema.Types.ObjectId, ref: 'Book', index: true }],
    follow: [{ type: Schema.Types.ObjectId, ref: 'Book', index: true }],
    rating: [
      {
        bookId: { type: Schema.Types.ObjectId, ref: 'Book', index: true },
        rating: { type: Number, min: 1, max: 5 },
        ratedAt: { type: Date, default: Date.now },
      },
    ],
    comment: [
      {
        bookId: { type: Schema.Types.ObjectId, ref: 'Book', index: true },
        content: String,
        createdAt: { type: Date, default: Date.now },
      },
    ],
  },
  { timestamps: true }
)

const History = mongoose.model('History', HistoryModel)

module.exports = History
