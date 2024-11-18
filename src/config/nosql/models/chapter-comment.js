const mongoose = require('mongoose')
const { Schema } = mongoose

const ChapterCommentModel = Schema(
  {
    chapterId: Schema.Types.ObjectId,
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

const ChapterComment = mongoose.model('ChapterComment', ChapterCommentModel)

module.exports = ChapterComment
