const express = require('express')

const router = express.Router()
const mustLogin = require('../middleware/must-login')
const { getBooks, getSingleBook } = require('../controllers/books')

router.get('/', mustLogin, getBooks)

router.get('/:id', mustLogin, getSingleBook)

module.exports = router
