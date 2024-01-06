const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')
const BookService = require('../services/book')

const bookSchema = new mongoose.Schema({
  title: {
    type: String,
    required: true,
  },
  authors: {
    type: String,
    required: true,
  },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Library',
    autopopulate: { maxDepth: 1 },
  },
  status: {
    // status can be one of: available, borrowed, lost (if destroyed, remove from db)
    type: String,
    required: true,
    enum: ['available', 'borrowed', 'lost'],
    default: 'available',
  },
  borrower: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    autopopulate: { maxDepth: 1 },
  },
  returnDate: {
    type: Date,
  },
})

bookSchema.plugin(autopopulate)
bookSchema.loadClass(BookService)
module.exports = mongoose.model('Book', bookSchema)
