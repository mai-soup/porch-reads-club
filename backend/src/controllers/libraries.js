const createError = require('http-errors')
const axios = require('axios')

const Library = require('../models/library')
const BookInfo = require('../models/book-info')
const BookCopy = require('../models/book-copy')
const Book = require('../models/book')
const User = require('../models/user')
const { uploadImage, deleteImage } = require('../lib/google-cloud-storage')
const descriptionEnhancer = require('../lib/description-enhancer')
const { getGeometryOfLocation } = require('../lib/geocoder')

module.exports.getSingleLibrary = async (req, res, next) => {
  const { id } = req.params

  try {
    const library = await Library.findById(id)

    if (!library) return next(createError(404, 'Library not found'))

    return res.send(library)
  } catch (err) {
    return next(
      createError(
        500,
        'An error occurred while retrieving the library. Please try again later.'
      )
    )
  }
}

module.exports.getAllLibraries = async (req, res, next) => {
  try {
    const libraries = await Library.find()
    return res.send(libraries)
  } catch (err) {
    return next(
      createError(
        500,
        'An error occurred while retrieving the libraries. Please try again later.'
      )
    )
  }
}

module.exports.createLibrary = async (req, res, next) => {
  const owner = req.user

  const { name, location } = req.body
  if (!name || !location)
    return next(createError(400, 'Name and location are required'))

  try {
    const geometry = await getGeometryOfLocation(location)

    const library = await Library.create({
      name,
      geometry,
      location,
      owner,
    })

    owner.ownedLibraries.push(library)
    owner.memberships.push(library)
    await owner.save()

    return res.status(201).send(library)
  } catch (err) {
    console.error(err)
    return next(createError(500, 'Error creating library'))
  }
}

module.exports.joinLibrary = async (req, res, next) => {
  const { id } = req.params
  const { user } = req
  try {
    const library = await Library.findById(id)
    if (!library) return next(createError(404, 'Library not found'))

    const newMember = await User.findOne({ username: user?.username })
    if (!newMember) return next(createError(404, 'User not found'))

    await newMember.joinLibrary(library)
    return res.status(201).send(library)
  } catch (err) {
    return next(createError(500, err.message))
  }
}

module.exports.leaveLibrary = async (req, res, next) => {
  const { id } = req.params
  const { user } = req
  try {
    const library = await Library.findById(id)
    if (!library) return next(createError(404, 'Library not found'))

    if (req.body.remove) {
      const userToRemove = await User.findOne({ username: user?.username })
      if (!userToRemove) return next(createError(404, 'User not found'))

      await userToRemove.leaveLibrary(library)
      return res.status(204).send()
    }

    return next(createError(400, 'Invalid request'))
  } catch (err) {
    console.error(err)
    return next(createError(500, err.message))
  }
}

module.exports.getAllMembers = async (req, res, next) => {
  const { id } = req.params
  try {
    const library = await Library.findById(id)
    if (!library) return next(createError(404, 'Library not found'))

    const { members } = library
    return res.send(members)
  } catch (err) {
    return next(createError(500, err.message))
  }
}

module.exports.updateBook = async (req, res, next) => {
  const { bookId } = req.params
  const { action } = req.body
  const { user } = req

  try {
    const book = await Book.findById(bookId)

    if (!book) {
      return next(createError(404, 'Book not found'))
    }

    try {
      switch (action) {
        case 'borrow':
          await user.borrowBook(book)
          break
        case 'return':
          await user.returnBook(book)
          break
        case 'extend':
          await book.extend()
          break
        case 'lose':
          await book.lose()
          break
        default:
          return next(createError(400, 'Invalid action'))
      }
    } catch (err) {
      return next(createError(403, err.message))
    }
    const updatedBook = await Book.findById(bookId)
    return res.send(updatedBook)
  } catch (err) {
    console.error(err)
    return next(
      createError(
        500,
        'An error occurred while updating the book. Please try again later.'
      )
    )
  }
}

module.exports.updateLibrary = async (req, res, next) => {
  try {
    const libraryId = req.params.id
    const { name, location } = req.body

    const library = await Library.findById(libraryId)
    if (!library) return next(createError(404, 'Library not found'))

    // only library owner can edit library
    const { user } = req
    if (user.id !== library.owner.id)
      return next(createError(403, 'You are not the owner of this library'))

    // update only the fields that have changed
    if (name && library.name !== name) library.name = name

    if (location && library.location !== location) {
      library.location = location

      const geometry = await getGeometryOfLocation(location)

      // update geometry
      library.geometry = geometry
    }

    const updatedLibrary = await library.save()

    return res.status(200).send(updatedLibrary)
  } catch (err) {
    console.error(err)
    return next(createError(500, err.message))
  }
}

module.exports.uploadImage = async (req, res, next) => {
  try {
    const myFile = req.file
    const { publicUrl, name } = await uploadImage(myFile)
    return res.status(200).json({
      message: 'Upload was successful',
      data: {
        publicUrl,
        name,
      },
    })
  } catch (error) {
    return next(createError(500, error.message))
  }
}

module.exports.deleteImage = async (req, res, next) => {
  const { filename } = req.params
  try {
    await deleteImage(filename)
    return res.status(200).json({
      message: 'File deleted successfully',
    })
  } catch (error) {
    return next(createError(500, error.message))
  }
}

module.exports.generateEnhancedDescription = async (req, res) => {
  const { description } = req.body
  if (!description) {
    return res.status(400).json({
      message: 'Please provide a description',
    })
  }
  const enhancedDescription = await descriptionEnhancer(description)
  return res.send(enhancedDescription)
}

module.exports.createBook = async (req, res, next) => {
  const { authors, title } = req.body

  if (!authors || !title) return next(createError(400, 'Missing parameters'))

  const library = await Library.findById(req.params.id)
  const book = await library.addBook({ title, authors })

  return res.status(201).send(book)
}

module.exports.removeBook = async (req, res, next) => {
  const book = await Book.findById(req.params.bookId)

  const library = await Library.findById(req.params.id)
  await library.removeBook(book)

  return res.status(204).send()
}
