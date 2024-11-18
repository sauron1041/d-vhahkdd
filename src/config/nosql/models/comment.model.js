const mongoose = require('mongoose')
const { Schema } = mongoose

const CommentModel = Schema(
  {
    reviewId: Schema.Types.ObjectId,
    user: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    content: String,
    postDate: Date,
  },
  {
    timestamps: true,
  }
)

const Comment = mongoose.model('Comment', CommentModel)

module.exports = Comment
