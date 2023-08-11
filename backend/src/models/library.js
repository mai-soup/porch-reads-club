const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')

const librarySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    minlength: 5,
    maxlength: 40,
    match: /^[a-zA-Z0-9 _-]+$/,
  },
  owner: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    autopopulate: { maxDepth: 1 },
  },
  latitude: {
    type: Number,
    required: true,
    min: -90,
    max: 90,
  },
  longitude: {
    type: Number,
    required: true,
    min: -180,
    max: 180,
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
})

// eslint-disable-next-line func-names
librarySchema.pre('save', async function (next) {
  await this.setOwner(this.owner)
  next()
})

// TODO: only owner can change name
class Library {
  async setOwner(newOwner) {
    // TODO: check that owner isn't suspended

    // subscribe new owner if owner has changed or document is new
    if (this.isModified('owner') || this.isNew) {
      if (!newOwner.memberships.includes(this)) {
        // subscribe new owner
        this.members.push(newOwner)
      }
    }
  }

  get location() {
    return [this.longitude, this.latitude]
  }

  async addMember(user) {
    if (this.members.includes(user)) return

    this.members.push(user)
    await this.save()
  }

  removeMember(user) {
    const index = this.members.indexOf(user)
    if (index === -1) {
      throw new Error('user is not a member of this library')
    }

    this.members.splice(index, 1)
  }

  async addBook(book) {
    if (!this.books.includes(book)) {
      await book.addToShelf(this)
    }
    this.books.push(book)
    await this.save()
  }

  removeBook(book) {
    const index = this.books.indexOf(book)
    if (index === -1) {
      throw new Error('book is not in this library')
    }
    const copies = this.books.filter(b => b.isbn === book.isbn)
    if (copies.length === 1) {
      book.removeFromShelf(this)
    }
    this.books.splice(index, 1)
  }
}

librarySchema.loadClass(Library)
librarySchema.plugin(autopopulate)

module.exports = mongoose.model('Library', librarySchema)