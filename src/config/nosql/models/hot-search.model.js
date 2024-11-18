const mongoose = require('mongoose')
const { Schema } = mongoose

const HotSearchModel = Schema(
  {
    keyword: {
      type: String,
      required: true,
      unique: true,
    },
    searchCount: {
      type: Number,
      default: 0,
    },
    isTrending: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
    },
    relatedBookIds: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Book',
      },
    ],
  },
  {
    timestamps: true,
  }
)

const HotSearch = mongoose.model('HotSearch', HotSearchModel)

module.exports = HotSearch
