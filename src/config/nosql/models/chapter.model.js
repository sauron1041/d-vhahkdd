const mongoose = require('mongoose')
const { Schema } = mongoose

const ChapterModel = Schema(
  {
    bookId: Schema.Types.ObjectId,
    contentId: Schema.Types.ObjectId,
    title: String,
    text: [String],
    images: [String],
    mp3s: [String],
    numberOfPage: Number,
    postDate: Date,
    updateDate: Date,
    comments: [
      {
        type: Schema.Types.ObjectId,
        ref: 'ChapterComment',
      },
    ],
    status: {
      type: String,
      required: true,
      enum: ['ACTIVE', 'INACTIVE'],
    },
  },
  {
    timestamps: true,
  }
)

const Chapter = mongoose.model('Chapter', ChapterModel)

module.exports = Chapter
