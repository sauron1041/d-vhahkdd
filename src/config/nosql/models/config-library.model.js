const mongoose = require('mongoose')
const { Schema } = mongoose

const ConfigLibraryModel = Schema(
  {
    name: String,
    desc: String,
    address: String,
    phone: String,
    email: String,
    banners: [String],
    logo: String,
    categories: [
      {
        type: Schema.Types.ObjectId,
        ref: 'Category',
      },
    ],
  },
  {
    timestamps: true,
  }
)

const Config = mongoose.model('Config', ConfigLibraryModel)

module.exports = Config
