const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')
const LibraryService = require('../services/library')

const librarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 40,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    autopopulate: { maxDepth: 1 },
  },
  location: {
    type: String,
    required: true,
  },
  geometry: {
    type: {
      type: String,
      enum: ['Point'],
      required: true,
    },
    coordinates: {
      type: [Number],
      required: true,
    },
  },
  members: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      autopopulate: { maxDepth: 1 },
    },
  ],
  books: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      autopopulate: { maxDepth: 1 },
    },
  ],
  imageName: String,
})

// eslint-disable-next-line func-names
librarySchema.pre('save', async function (next) {
  await this.setOwner(this.owner)
  next()
})

librarySchema.loadClass(LibraryService)
librarySchema.plugin(autopopulate)

module.exports = mongoose.model('Library', librarySchema)
