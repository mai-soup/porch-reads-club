const express = require('express')

const router = express.Router()
const mustLogin = require('../middleware/must-login')
const {
  getOpenLibraryBook,
  createBook,
  getBooks,
  getSingleBook,
} = require('../controllers/books')

// router.get('/:openLibraryId', mustLogin, getOpenLibraryBook)

router.post('/', mustLogin, createBook)

router.get('/', mustLogin, getBooks)

router.get('/:id', mustLogin, getSingleBook)

module.exports = router
