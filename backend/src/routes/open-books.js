const express = require('express')
const axios = require('axios')
const ISBN = require('isbn3')
const createError = require('http-errors')

const router = express.Router()

router.get('/', async (req, res, next) => {
  const query = req.query.q

  if (!query) return next(createError(400, 'Missing query'))

  const response = (
    await axios.get(`https://openlibrary.org/search.json?q=${query}&limit=20`)
  ).data.docs

  if (!response.length) return next(createError(404, 'No results found'))

  const results = response.map(book => ({
    title: book.title,
    authors: book.author_name.join(', '),
    id: book.key,
    coverUrl: book.cover_i
      ? `https://covers.openlibrary.org/b/id/${book.cover_i}-M.jpg`
      : null,
  }))

  return res.send(results)
})

module.exports = router
