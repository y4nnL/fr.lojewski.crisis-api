import supertest from 'supertest'
import { app } from '@/core/server'
import { BadRequestAPIError, ErrorId, joiPasswordRegex } from '@/types'
import { connect, disconnect } from '~/helpers/db'
import { getSignatureHeaders } from '~/helpers/utils'

describe('token routes', () => {
  
  const email = 'test@test.com'
  const password = 'aA1!yeah'
  const url = '/api/token'
  
  beforeAll(async () => {
    await connect()
  })
  
  afterAll(async () => {
    await disconnect()
  })
  
  it('::joiPasswordRegex', () => {
    const chars = ['a', 'A', '1', '!']
    chars.forEach((one) => { chars.forEach((two) => { chars.forEach((three) => { chars.forEach((four) => {
      one != two && one != three && one != four && two != three && two != four && three != four ?
        expect(joiPasswordRegex.test(one + two + three + four)).toStrictEqual(true) :
        expect(joiPasswordRegex.test(one + two + three + four)).toStrictEqual(false)
    })})})});
  })
  
  describe('1. validate', () => {
    
    it('should not pass [EmailRequired]', async () => {
      const response = await supertest(app)
        .post(`${ url }/authorization`)
        .set(await getSignatureHeaders())
      expect(response.status).toStrictEqual(400)
      expect(response.body.message).toStrictEqual(new BadRequestAPIError([
        ErrorId.EmailRequired,
        ErrorId.PasswordRequired,
      ]).toString())
    })
    
    it('should not pass [EmailNotString]', async () => {
      const response = await supertest(app)
        .post(`${ url }/authorization`)
        .set(await getSignatureHeaders())
        .send({ email: 42 })
      expect(response.status).toStrictEqual(400)
      expect(response.body.message).toStrictEqual(new BadRequestAPIError([
        ErrorId.EmailNotString,
        ErrorId.PasswordRequired,
      ]).toString())
    })
    
    it('should not pass [EmailEmpty]', async () => {
      const response = await supertest(app)
        .post(`${ url }/authorization`)
        .set(await getSignatureHeaders())
        .send({ email: '' })
      expect(response.status).toStrictEqual(400)
      expect(response.body.message).toStrictEqual(new BadRequestAPIError([
        ErrorId.EmailEmpty,
        ErrorId.PasswordRequired,
      ]).toString())
    })
    
    it('should not pass [EmailMalformed]', async () => {
      const response = await supertest(app)
        .post(`${ url }/authorization`)
        .set(await getSignatureHeaders())
        .send({ email: '42' })
      expect(response.status).toStrictEqual(400)
      expect(response.body.message).toStrictEqual(new BadRequestAPIError([
        ErrorId.EmailMalformed,
        ErrorId.PasswordRequired,
      ]).toString())
    })
    
    it('should not pass [PasswordRequired]', async () => {
      const response = await supertest(app)
        .post(`${ url }/authorization`)
        .set(await getSignatureHeaders())
        .send({ email })
      expect(response.status).toStrictEqual(400)
      expect(response.body.message).toStrictEqual(new BadRequestAPIError([ErrorId.PasswordRequired]).toString())
    })
    
    it('should not pass [PasswordNotString]', async () => {
      const response = await supertest(app)
        .post(`${ url }/authorization`)
        .set(await getSignatureHeaders())
        .send({ email, password: 42 })
      expect(response.status).toStrictEqual(400)
      expect(response.body.message).toStrictEqual(new BadRequestAPIError([ErrorId.PasswordNotString]).toString())
    })
    
    it('should not pass [PasswordEmpty]', async () => {
      const response = await supertest(app)
        .post(`${ url }/authorization`)
        .set(await getSignatureHeaders())
        .send({ email, password: '' })
      expect(response.status).toStrictEqual(400)
      expect(response.body.message).toStrictEqual(new BadRequestAPIError([ErrorId.PasswordEmpty]).toString())
    })
    
    it('should not pass [PasswordTooShort]', async () => {
      const response = await supertest(app)
        .post(`${ url }/authorization`)
        .set(await getSignatureHeaders())
        .send({ email, password: '42' })
      expect(response.status).toStrictEqual(400)
      expect(response.body.message).toStrictEqual(new BadRequestAPIError([
        ErrorId.PasswordTooShort,
        ErrorId.PasswordMalformed,
      ]).toString())
    })
    
    it('should not pass [PasswordTooLong]', async () => {
      const response = await supertest(app)
        .post(`${ url }/authorization`)
        .set(await getSignatureHeaders())
        .send({ email, password: '012345678901234567890123456789' })
      expect(response.status).toStrictEqual(400)
      expect(response.body.message).toStrictEqual(new BadRequestAPIError([
        ErrorId.PasswordTooLong,
        ErrorId.PasswordMalformed,
      ]).toString())
    })
    
    it('should not pass [PasswordMalformed]', async () => {
      const response = await supertest(app)
        .post(`${ url }/authorization`)
        .set(await getSignatureHeaders())
        .send({ email, password: 'aaaaaaaa' })
      expect(response.status).toStrictEqual(400)
      expect(response.body.message).toStrictEqual(new BadRequestAPIError([ErrorId.PasswordMalformed]).toString())
    })
    
  })
  
})
