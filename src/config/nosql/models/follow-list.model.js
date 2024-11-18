const mongoose = require('mongoose')
const { Schema } = mongoose

const FollowListModel = Schema(
  {
    userId: Schema.Types.ObjectId,
    books: [{ type: Schema.Types.ObjectId, ref: 'Book' }],
  },
  {
    timestamps: true,
  }
)

const FollowList = mongoose.model('FollowList', FollowListModel)

module.exports = FollowList
