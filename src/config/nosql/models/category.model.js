const mongoose = require('mongoose')
const { Schema } = mongoose

const CategoryModel = Schema(
  {
    name: String,
    desc: String,
    image: String,
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

const Category = mongoose.model('Category', CategoryModel)

module.exports = Category
