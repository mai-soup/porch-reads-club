const express = require('express')

const router = express.Router()
const User = require('../models/user')

router.get('/', async (req, res) => {
  try {
    const allUsers = await User.find()
    return res.send(allUsers)
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .send(
        'An error occurred while retrieving user information. Please try again later.'
      )
  }
})

router.post('/', async (req, res) => {
  const { username, email } = req.body

  if (!username || !email) {
    return res.status(400).send('Username and email are required')
  }

  try {
    const user = await User.create({ username, email })
    return res.status(201).send(user)
  } catch (err) {
    // code 11000 represents a duplicate key error in mongo
    if (error.code === 11000) {
      return res.status(409).json({ error: 'Username or email already exists' })
    }

    // other errors
    console.error(error)
    res.status(500).json({
      error: 'An error occured while adding the user. Please try again later.',
    })
  }
})

router.get('/:username', async (req, res) => {
  const { username } = req.params

  try {
    const user = await User.findOne({ username })

    if (!user) {
      return res.status(404).send('User not found')
    }

    return res.send(user)
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .send(
        'An error occurred while retrieving the user. Please try again later.'
      )
  }
})

router.post('/:username/ownedLibraries', async (req, res) => {
  const { username } = req.params
  let user

  try {
    user = await User.findOne({ username })
  } catch (err) {
    console.error(err)
    return res
      .status(500)
      .send(
        'An error occurred while retrieving the user information. Please try again later.'
      )
  }

  if (!user) {
    return res.status(404).send('User not found')
  }

  const { name, latitude, longitude } = req.body

  // can't check for !name || !latitude || !longitude because latitude and longitude can be 0
  if (!name || latitude === undefined || longitude === undefined) {
    return res.status(400).send('Name, latitude, and longitude are required')
  }

  let library

  try {
    library = await user.createLibrary({ name, latitude, longitude })
  } catch (error) {
    console.error(error)
    return res
      .status(500)
      .send(
        'An error occurred while creating the library. Please try again later.'
      )
  }

  return res.status(201).send(library)
})

module.exports = router
