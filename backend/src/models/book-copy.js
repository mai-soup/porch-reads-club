const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const bookCopySchema = new mongoose.Schema({
  bookInfo: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'BookInfo',
    required: true,
    autopopulate: { maxDepth: 1 },
  },
  library: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Library',
    required: true,
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
  // TODO: add history of borrows? should this be kept under a user?
  // how to be sure that the correct copy is updated if there are several? difficult.
})

bookCopySchema.plugin(autopopulate)

module.exports = mongoose.model('BookCopy', bookCopySchema)
