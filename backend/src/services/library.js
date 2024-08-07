const Book = require('../models/book')

// TODO: only owner can change name

// TODO: compare ids with .equals() instead of casting to string
class LibraryService {
  async addMember(user) {
    const memberIds = this.members.map(member => member._id.toString())

    if (memberIds.includes(user._id.toString())) return

    this.members.push(user)
    await this.save()
  }

  async removeMember(user) {
    const userId = user._id.toString()
    const memberIds = this.members.map(member => member._id.toString())

    if (!memberIds.includes(userId)) {
      throw new Error('user is not a member of this library')
    }

    const index = memberIds.indexOf(userId)
    this.members.splice(index, 1)

    await this.save()
  }

  async addBook({ title, authors }) {
    const book = await Book.create({ title, authors, library: this })

    this.books.push(book)
    await this.save()
    return book
  }

  async removeBook(book) {
    const index = this.books.findIndex(
      b => b._id.toString() === book._id.toString()
    )
    if (index === -1) {
      throw new Error('book is not in this library')
    }

    await Book.findByIdAndDelete(book._id)
    this.books.splice(index, 1)
    await this.save()
  }
}

module.exports = LibraryService
