const Library = require('../models/library')
const Book = require('../models/book')

class UserService {
  async createLibrary({ name, location, latitude, longitude }) {
    const newLibrary = await Library.create({
      name,
      owner: this,
      location,
      geometry: {
        type: 'Point',
        coordinates: [longitude, latitude],
      },
    })

    this.memberships.push(newLibrary)
    await this.save()
    await newLibrary.save()
    return newLibrary
  }

  async joinLibrary(library) {
    if (
      this.memberships.find(m => m._id.toString() === library._id.toString())
    ) {
      throw new Error('user is already a member of this library')
    }

    this.memberships.push(library)
    await this.save()
    await library.addMember(this)
  }

  async leaveLibrary(library) {
    const libraryId = library._id.toString()
    const membershipIds = this.memberships.map(m => m._id.toString())

    if (!membershipIds.includes(libraryId)) {
      throw new Error('user is not member of this library')
    }

    const libraryIndex = membershipIds.indexOf(libraryId)
    this.memberships.splice(libraryIndex, 1)

    await this.save()
    await library.removeMember(this)
  }

  async borrowBook(book) {
    if (book.status !== 'available') {
      throw new Error('book copy is not available')
    }

    await book.borrow(this)
    this.loans.push(book)
    await this.save()
  }

  async returnBook(book) {
    const bookObj = await Book.findById(book._id)

    if (
      bookObj.status !== 'borrowed' ||
      bookObj.borrower._id.toString() !== this._id.toString()
    ) {
      throw new Error('book is not borrowed by this user')
    }

    await bookObj.return()
    const bookId = bookObj._id.toString()
    // filter out bookCopy from loans
    this.loans = this.loans.filter(loan => loan._id.toString() !== bookId)
    await this.save()
  }
}

module.exports = UserService
