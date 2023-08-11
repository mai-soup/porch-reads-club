const request = require('supertest')
const chance = require('chance').Chance()
const User = require('../../src/models/user')
const Library = require('../../src/models/library')
const app = require('../../src/app')

// restore the original behavior of mocked functions
afterEach(() => {
  jest.restoreAllMocks()
})

it('should sign up a new user', async () => {
  const user = {
    username: 'maijs',
    email: 'mai@example.com',
  }
  const response = await request(app).post('/users').send(user)

  expect(response.status).toBe(201)
  expect(response.body).toMatchObject(user)
})

it('should not sign up a new user with an existing username', async () => {
  const user = {
    username: 'abc',
    email: 'abc@example.com',
  }
  await request(app).post('/users').send(user)

  const user2 = {
    username: 'abc',
    email: 'def@example.com',
  }

  const response = await request(app).post('/users').send(user2)
  expect(response.status).toBe(409)
})

it('should not sign up a new user with an existing email', async () => {
  const user = {
    username: 'xyz',
    email: 'xyz@example.com',
  }
  await request(app).post('/users').send(user)

  const user2 = {
    username: 'uvw',
    email: 'xyz@example.com',
  }

  const response = await request(app).post('/users').send(user2)
  expect(response.status).toBe(409)
})

it('should not sign up a new user without a username', async () => {
  const user = {
    email: chance.email(),
  }

  const response = await request(app).post('/users').send(user)
  expect(response.status).toBe(400)
})

it('should not sign up a new user without an email', async () => {
  const user = {
    username: chance.word(),
  }

  const response = await request(app).post('/users').send(user)
  expect(response.status).toBe(400)
})

it('should not sign up a new user with an empty username', async () => {
  const user = {
    username: '',
    email: chance.email(),
  }

  const response = await request(app).post('/users').send(user)
  expect(response.status).toBe(400)
})

it('should not sign up a new user with an empty email', async () => {
  const user = {
    username: chance.word(),
    email: '',
  }

  const response = await request(app).post('/users').send(user)
  expect(response.status).toBe(400)
})

it('should handle server errors when signing up a new user', async () => {
  jest.spyOn(User, 'create').mockImplementationOnce(() => {
    throw new Error('error')
  })

  const user = {
    username: chance.word(),
    email: chance.email(),
  }

  const response = await request(app).post('/users').send(user)
  expect(response.status).toBe(500)
})

it('should get all users', async () => {
  const user = await User.create({
    username: 'beeper',
    email: 'beepboop@gmail.com',
  })
  const response = await request(app).get('/users')

  expect(response.status).toBe(200)
  expect(response.body).toContainEqual(
    expect.objectContaining({
      username: user.username,
      email: user.email,
    })
  )
})

it('should handle server errors when getting all users', async () => {
  jest.spyOn(User, 'find').mockImplementationOnce(() => {
    throw new Error('error')
  })

  const response = await request(app).get('/users')
  expect(response.status).toBe(500)
})

it('should get a user by username', async () => {
  const user = await User.create({
    username: chance.word({ length: 5 }),
    email: chance.email(),
  })

  const response = await request(app).get(`/users/${user.username}`)
  expect(response.status).toBe(200)
  expect(response.body).toMatchObject({
    username: user.username,
    email: user.email,
  })
})

it('should handle server errors when getting a user by username', async () => {
  jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
    throw new Error('error')
  })

  const user = await User.create({
    username: chance.word({ length: 5 }),
    email: chance.email(),
  })

  const response = await request(app).get(`/users/${user.username}`)
  expect(response.status).toBe(500)
})

it('should return a 404 when getting a user by username that does not exist', async () => {
  let username = chance.word({ length: 5 })

  // make sure the username does not exist
  while (await User.exists({ username })) {
    username = chance.word({ length: 5 })
  }

  const response = await request(app).get(`/users/${username}`)
  expect(response.status).toBe(404)
})

it('should create a valid library for a user', async () => {
  const user = await User.create({
    username: chance.word({ length: 5 }),
    email: chance.email(),
  })

  const library = {
    name: chance.word({ length: 5 }),
    latitude: chance.latitude(),
    longitude: chance.longitude(),
  }

  const response = await request(app)
    .post(`/users/${user.username}/ownedLibraries`)
    .send(library)
  expect(response.status).toBe(201)
  expect(response.body).toMatchObject(library)
})

it('should handle server errors when creating a library for a user', async () => {
  jest.spyOn(User, 'findOne').mockImplementationOnce(() => {
    throw new Error('error')
  })

  const user = await User.create({
    username: chance.word({ length: 5 }),
    email: chance.email(),
  })

  const library = {
    name: chance.word({ length: 5 }),
    latitude: chance.latitude(),
    longitude: chance.longitude(),
  }

  const response1 = await request(app)
    .post(`/users/${user.username}/ownedLibraries`)
    .send(library)
  expect(response1.status).toBe(500)

  jest.spyOn(Library, 'create').mockImplementationOnce(() => {
    throw new Error('error')
  })

  const response2 = await request(app)
    .post(`/users/${user.username}/ownedLibraries`)
    .send(library)
  expect(response2.status).toBe(500)
})

it('should return a 404 when creating a library for a user that does not exist', async () => {
  let username = chance.word({ length: 5 })

  // make sure the username does not exist
  while (await User.exists({ username })) {
    username = chance.word({ length: 5 })
  }

  const library = {
    name: chance.word({ length: 5 }),
    latitude: chance.latitude(),
    longitude: chance.longitude(),
  }

  const response = await request(app)
    .post(`/users/${username}/ownedLibraries`)
    .send(library)
  expect(response.status).toBe(404)
})

it('should return a 400 when trying to create a library with invalid location', async () => {
  const user = await User.create({
    username: chance.word({ length: 5 }),
    email: chance.email(),
  })

  const library = {
    name: chance.word({ length: 5 }),
    latitude: chance.latitude(),
  }

  const response = await request(app)
    .post(`/users/${user.username}/ownedLibraries`)
    .send(library)
  expect(response.status).toBe(400)

  const library2 = {
    name: chance.word({ length: 5 }),
    longitude: chance.longitude(),
  }

  const response2 = await request(app)
    .post(`/users/${user.username}/ownedLibraries`)
    .send(library2)
  expect(response2.status).toBe(400)

  const library3 = {
    name: chance.word({ length: 5 }),
  }

  const response3 = await request(app)
    .post(`/users/${user.username}/ownedLibraries`)
    .send(library3)
  expect(response3.status).toBe(400)
})

it('should return a 400 when trying to create a library with an empty or no name', async () => {
  const user = await User.create({
    username: chance.word({ length: 5 }),
    email: chance.email(),
  })

  const library = {
    name: '',
    latitude: chance.latitude(),
    longitude: chance.longitude(),
  }

  const response = await request(app)
    .post(`/users/${user.username}/ownedLibraries`)
    .send(library)
  expect(response.status).toBe(400)

  const library2 = {
    latitude: chance.latitude(),
    longitude: chance.longitude(),
  }

  const response2 = await request(app)
    .post(`/users/${user.username}/ownedLibraries`)
    .send(library2)
  expect(response2.status).toBe(400)
})

// TODO: test with invalid params
