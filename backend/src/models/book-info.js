const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')
const BookInfoService = require('../services/book-info')

const bookInfoSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  authors: {
    type: [
      {
        type: String,
        required: true,
      },
    ],
    validate: {
      validator(arr) {
        return arr && arr.length > 0
      },
      message: 'At least one author is required.',
    },
  },
  openLibraryId: {
    type: String,
    required: true,
    unique: true,
  },
  imageUrl: {
    type: String,
  },
  librariesFoundIn: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Library',
      autopopulate: { maxDepth: 1 },
    },
  ],
})

bookInfoSchema.loadClass(BookInfoService)
bookInfoSchema.plugin(autopopulate)
module.exports = mongoose.model('BookInfo', bookInfoSchema)
