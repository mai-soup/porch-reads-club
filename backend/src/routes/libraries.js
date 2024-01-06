const express = require('express')

const router = express.Router()
const mustLogin = require('../middleware/must-login')

const {
  getSingleLibrary,
  getAllLibraries,
  createLibrary,
  joinLibrary,
  leaveLibrary,
  updateBook,
  updateLibrary,
  getAllMembers,
  createBook,
  removeBook,
} = require('../controllers/libraries')

router.get('/', getAllLibraries)
router.get('/:id', getSingleLibrary)

router.post('/', mustLogin, createLibrary)
router.patch('/:id', mustLogin, updateLibrary)

router.get('/:id/members', mustLogin, getAllMembers)
router.post('/:id/members', mustLogin, joinLibrary)
router.patch('/:id/members', mustLogin, leaveLibrary)

router.post('/:id/books', mustLogin, createBook)
router.delete('/:id/books/:bookId', mustLogin, removeBook)
router.patch('/:id/books/:bookId', mustLogin, updateBook)

module.exports = router
