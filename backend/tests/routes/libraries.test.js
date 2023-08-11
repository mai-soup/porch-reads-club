const request = require('supertest')
const app = require('../../src/app')
const chance = require('chance').Chance()
const Library = require('../../src/models/library')
const User = require('../../src/models/user')

// restore the original behavior of mocked functions
afterEach(() => {
  jest.restoreAllMocks()
})

it('should list all libraries', async () => {
  const owner = await User.create({
    username: chance.word({ length: 5 }),
    email: chance.email(),
  })

  const library1 = {
    name: chance.word({ length: 25 }),
    longitude: chance.longitude(),
    latitude: chance.latitude(),
  }
  const library2 = {
    name: chance.word({ length: 25 }),
    longitude: chance.longitude(),
    latitude: chance.latitude(),
  }
  await owner.createLibrary(library1)
  await owner.createLibrary(library2)

  const response = await request(app).get('/libraries')
  expect(response.status).toBe(200)
  expect(response.body).toMatchObject(
    expect.arrayContaining([
      expect.objectContaining(library1),
      expect.objectContaining(library2),
    ])
  )
})

it('should handle server errors when listing libraries', async () => {
  jest.spyOn(Library, 'find').mockRejectedValue(new Error('oops'))

  const response = await request(app).get('/libraries')
  expect(response.status).toBe(500)
})
