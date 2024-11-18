const mongoose = require('mongoose')
const { Schema } = mongoose

const ReviewModel = Schema(
  {
    bookId: Schema.Types.ObjectId,
    totalLike: Number,
    totalView: Number,
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Comment',
      },
    ],
    rate: Number,
    rating: [
      {
        type: Number,
        min: 0,
        max: 5,
      },
    ],
  },
  {
    timestamps: true,
  }
)

const Review = mongoose.model('Review', ReviewModel)

module.exports = Review
