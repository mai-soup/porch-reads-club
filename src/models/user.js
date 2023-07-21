module.exports = class User {
  #username
  subscribedBookshelves = []

  constructor({ username, email }) {
    this.username = username
    this.email = email
    this.dateCreated = new Date()
  }

  set username(newUsername) {
    // username requirements:
    // - string 3-24 chars in length
    // - only alphanumeric, dashes, underscores
    // - case-insensitively unique
    if (typeof newUsername !== 'string') {
      throw new Error('username must be a string')
    }
    if (newUsername.length < 3 || newUsername.length > 24) {
      throw new Error('username must be 3-24 characters in length')
    }
    if (!newUsername.match(/^[a-zA-Z0-9_-]+$/)) {
      throw new Error(
        'username must only contain alphanumeric, dashes, and underscores'
      )
    }
    // TODO: check for case-insensitive uniqueness

    this.#username = newUsername
  }

  get username() {
    return this.#username
  }
}
