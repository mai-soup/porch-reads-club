const mongoose = require('mongoose')
const autopopulate = require('mongoose-autopopulate')
const passportLocalMongoose = require('passport-local-mongoose')
const Library = require('./library')

const userSchema = new mongoose.Schema({
  // username: {
  //   type: String,
  //   required: true,
  //   minlength: 3,
  //   maxlength: 24,
  //   match: /^[a-zA-Z0-9_-]+$/,
  //   // TODO: make uniqueness case-insensitive
  //   unique: true,
  // },
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
})

class User {
  async createLibrary({ name, latitude, longitude }) {
    const newLibrary = await Library.create({
      name,
      owner: this,
      latitude,
      longitude,
    })

    this.memberships.push(newLibrary)
    await this.save()
    await newLibrary.save()
    return newLibrary
  }

  async joinLibrary(library) {
    this.memberships.push(library)
    await this.save()
    await library.addMember(this)
  }

  async leaveLibrary(library) {
    const libraryId = library._id.toString()
    const membershipIds = this.memberships.map(m => m._id.toString())

    if (!membershipIds.includes(libraryId)) {
      throw new Error('user is not member of this library')
    }

    const libraryIndex = membershipIds.indexOf(libraryId)
    this.memberships.splice(libraryIndex, 1)

    await this.save()
    await library.removeMember(this)
  }
}

userSchema.loadClass(User)
userSchema.plugin(autopopulate)
userSchema.plugin(passportLocalMongoose)

module.exports = mongoose.model('User', userSchema)
