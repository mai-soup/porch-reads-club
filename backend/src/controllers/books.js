const createError = require('http-errors')
const Book = require('../models/book')

module.exports.getSingleBook = async (req, res, next) => {
  const book = await Book.findById(req.params.id)

  if (!book) return next(createError(404, 'Book not found'))
  return res.send(book)
}

module.exports.getBooks = async (req, res, next) => {
  const books = await Book.find()

  return res.send(books)
}
