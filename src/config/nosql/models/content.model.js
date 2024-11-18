const mongoose = require('mongoose')
const { Schema } = mongoose
const Chapter = require('./chapter.model')

const ContentModel = Schema(
  {
    bookId: Schema.Types.ObjectId,
    numberOfChapter: Number,
    chapters: [{ type: Schema.Types.ObjectId, ref: 'Chapter' }],
  },
  {
    timestamps: true,
  }
)

const Content = mongoose.model('Content', ContentModel)

module.exports = Content
