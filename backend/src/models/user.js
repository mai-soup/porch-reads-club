const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')
const passportLocalMongoose = require('passport-local-mongoose')
const PasswordValidator = require('password-validator')
const UserService = require('../services/user')

const userSchema = new mongoose.Schema({
  username: {
    type: String,
    required: true,
    minlength: 3,
    maxlength: 24,
    match: /^[a-zA-Z0-9_-]+$/, // alphanumeric, underscore, and dash characters only
    //   // TODO: make uniqueness case-insensitive
    unique: true,
  },
  email: {
    // TODO: validate email
    type: String,
    required: true,
    unique: true,
  },
  dateCreated: {
    type: Date,
    default: Date.now,
  },
  memberships: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Library',
      autopopulate: { maxDepth: 2 },
    },
  ],
  ownedLibraries: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Library',
      autopopulate: { maxDepth: 2 },
    },
  ],
  loans: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Book',
      autopopulate: { maxDepth: 2 },
    },
  ],
})

const passwordSchema = new PasswordValidator()

passwordSchema
  .is()
  .min(8)
  .is()
  .max(64)
  .has()
  .uppercase()
  .has()
  .lowercase()
  .has()
  .symbols()
  .has()
  .digits()

const validatePassword = function (password, cb) {
  const result = passwordSchema.validate(password, { list: true })
  if (result.length > 0) {
    return cb(result)
  }
  // return an empty cb() on success
  return cb()
}

userSchema.loadClass(UserService)
userSchema.plugin(autopopulate)
userSchema.plugin(passportLocalMongoose, {
  usernameQueryFields: ['email'],
  passwordValidator: validatePassword,
})

module.exports = mongoose.model('User', userSchema)
