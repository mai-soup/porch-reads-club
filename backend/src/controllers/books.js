const createError = require('http-errors')
const axios = require('axios')
const Fuse = require('fuse.js')

const BookInfo = require('../models/book-info')
const Book = require('../models/book')

module.exports.getSingleBook = async (req, res, next) => {
  const book = await Book.findById(req.params.id)

  if (!book) return next(createError(404, 'Book not found'))
  return res.send(book)
}

module.exports.getOpenLibraryBook = async (req, res, next) => {
  const { openLibraryId } = req.params

  try {
    const bookInfo = await BookInfo.findOne({ openLibraryId })

    if (!bookInfo) return next(createError(404, 'Book not found'))

    return res.send(bookInfo)
  } catch (err) {
    return next(
      createError(
        500,
        "An error occurred while retrieving the book's info. Please try again later."
      )
    )
  }
}

module.exports.createBook = async (req, res, next) => {
  const { id } = req.body

  if (!id) return next(createError(400, 'Missing parameters'))

  try {
    // check if volume already exists in db
    const book = await BookInfo.findOne({ openLibraryId: id })
    if (book) {
      return res.status(409).send(book)
    }

    // fetch book info from OpenLibrary API
    const volume = await axios.get(`https://openlibrary.org/works/${id}.json`)
    // TODO: handle errors

    const { title, covers, authors } = volume.data

    // convert author objects to author names
    const authorIds = authors.map(item => item.author.key)

    const authorNames = await Promise.all(
      authorIds.map(async a => {
        const author = await axios.get(`https://openlibrary.org${a}.json`)
        return author.data.name
      })
    )
    // construct bookInfo
    const newBook = await BookInfo.create({
      openLibraryId: id,
      title,
      authors: [...new Set(authorNames)], // remove duplicate authors
      imageUrl: covers
        ? `https://covers.openlibrary.org/b/id/${covers[0]}-M.jpg`
        : null,
    })

    return res.status(201).send(newBook)
  } catch (err) {
    console.error(err)
    return next(createError(500, 'Error adding book'))
  }
}

module.exports.getBooks = async (req, res, next) => {
  const books = await Book.find()

  return res.send(books)
}
