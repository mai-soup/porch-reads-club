const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

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
})

bookSchema.plugin(autopopulate)
module.exports = mongoose.model('Book', bookSchema)
