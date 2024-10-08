const createError = require('http-errors')
const User = require('../models/user')
const catchAsync = require('../utils/catch-async')

module.exports.registerUser = catchAsync(async (req, res, next) => {
  try {
    const { username, email, password } = req.body
    const user = await User.register({ username, email }, password)

    // strip hash and salt from user object before sending it to the client
    const safeUser = await User.findById(user._id).select('-hash -salt').lean()
    return res.send(safeUser)
  } catch (err) {
    if (
      err.name === 'ValidationError' ||
      err.code === 11000 ||
      err.name === 'UserExistsError'
    ) {
      // handle validation or duplicate key errors separately
      return next(createError(400, 'Registration failed'))
    }
    return next(createError(500, err))
  }
})

module.exports.getAuthenticatedUser = (req, res) => {
  // strip salt and hash from user object before sending it to the client
  delete req.user.hash
  delete req.user.salt
  return res.send(req.user)
}

module.exports.logoutAndDestroySession = (req, res, next) => {
  // return to appease the eslint overlords
  return req.logout(err => {
    if (err) return next(createError(500, 'Logout failed'))

    // return to appease the eslint overlords
    return res.sendStatus(200)
  })
}
