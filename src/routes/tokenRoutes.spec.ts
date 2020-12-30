import assert from '@/utils/assert'
import bcrypt from 'bcrypt'
import supertest from 'supertest'
import { anonymizeErrorLogger } from '@/middlewares/anonymizeErrorMiddleware'
import { app } from '@/core/server'
import {
  BadRequestAPIError,
  ErrorId,
  ForbiddenAPIError,
  joiPasswordRegex,
  NotFoundAPIError,
  UnauthorizedAPIError, UserAction,
} from '@/types'
import { connect, disconnect } from '~/helpers/db'
import { getSignatureHeaders } from '~/helpers/utils'
import { User, UserDocument, UserModel } from '@/models'

describe('token routes', () => {
  
  let token = ''
  
  const anonymizeErrorLoggerSpy = jest.spyOn(anonymizeErrorLogger, 'pass')
  const email = 'test@test.com'
  const password = 'aA1!yeah'
  const unauthorized = new UnauthorizedAPIError()
  const url = '/api/token'
  
  async function postAuthorization(send: null | object | true) {
    const response = supertest(app)
      .post(`${ url }/authorization`)
      .set(await getSignatureHeaders())
    if (send !== null) {
      if (send === true) {
        response.send({ email, password })
      } else {
        response.send(send)
      }
    }
    return response
  }
  
  async function deleteAuthorization(bearer?: true) {
    const response = supertest(app)
      .delete(`${ url }/authorization`)
      .set(await getSignatureHeaders())
    if (bearer) {
      response.set('x-authorization', 'Bearer ' + token)
    }
    return response
  }
  
  beforeAll(async () => {
    await connect()
  })
  
  afterAll(async () => {
    await disconnect()
  })
  
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  it('::joiPasswordRegex', () => {
    const chars = [ 'a', 'A', '1', '!' ]
    chars.forEach((one) => {
      chars.forEach((two) => {
        chars.forEach((three) => {
          chars.forEach((four) => {
            one != two && one != three && one != four && two != three && two != four && three != four ?
              expect(joiPasswordRegex.test(one + two + three + four)).toStrictEqual(true) :
              expect(joiPasswordRegex.test(one + two + three + four)).toStrictEqual(false)
          })
        })
      })
    });
  })
  
  describe('/authorization post', () => {
    
    describe('1. validate(authorizationCreateSchema, {}, { abortEarly: false })', () => {
      
      it('should not pass [EmailRequired]', async () => {
        const response = await postAuthorization(null)
        expect(response.status).toStrictEqual(400)
        expect(response.body.message).toStrictEqual(new BadRequestAPIError([
          ErrorId.EmailRequired,
          ErrorId.PasswordRequired,
        ]).toString())
      })
      
      it('should not pass [EmailNotString]', async () => {
        const response = await postAuthorization({ email: 42 })
        expect(response.status).toStrictEqual(400)
        expect(response.body.message).toStrictEqual(new BadRequestAPIError([
          ErrorId.EmailNotString,
          ErrorId.PasswordRequired,
        ]).toString())
      })
      
      it('should not pass [EmailEmpty]', async () => {
        const response = await postAuthorization({ email: '' })
        expect(response.status).toStrictEqual(400)
        expect(response.body.message).toStrictEqual(new BadRequestAPIError([
          ErrorId.EmailEmpty,
          ErrorId.PasswordRequired,
        ]).toString())
      })
      
      it('should not pass [EmailMalformed]', async () => {
        const response = await postAuthorization({ email: '42' })
        expect(response.status).toStrictEqual(400)
        expect(response.body.message).toStrictEqual(new BadRequestAPIError([
          ErrorId.EmailMalformed,
          ErrorId.PasswordRequired,
        ]).toString())
      })
      
      it('should not pass [PasswordRequired]', async () => {
        const response = await postAuthorization({ email })
        expect(response.status).toStrictEqual(400)
        expect(response.body.message).toStrictEqual(new BadRequestAPIError([ ErrorId.PasswordRequired ]).toString())
      })
      
      it('should not pass [PasswordNotString]', async () => {
        const response = await postAuthorization({ email, password: 42 })
        expect(response.status).toStrictEqual(400)
        expect(response.body.message).toStrictEqual(new BadRequestAPIError([ ErrorId.PasswordNotString ]).toString())
      })
      
      it('should not pass [PasswordEmpty]', async () => {
        const response = await postAuthorization({ email, password: '' })
        expect(response.status).toStrictEqual(400)
        expect(response.body.message).toStrictEqual(new BadRequestAPIError([ ErrorId.PasswordEmpty ]).toString())
      })
      
      it('should not pass [PasswordTooShort]', async () => {
        const response = await postAuthorization({ email, password: '42' })
        expect(response.status).toStrictEqual(400)
        expect(response.body.message).toStrictEqual(new BadRequestAPIError([
          ErrorId.PasswordTooShort,
          ErrorId.PasswordMalformed,
        ]).toString())
      })
      
      it('should not pass [PasswordTooLong]', async () => {
        const response = await postAuthorization({ email, password: '012345678901234567890123456789' })
        expect(response.status).toStrictEqual(400)
        expect(response.body.message).toStrictEqual(new BadRequestAPIError([
          ErrorId.PasswordTooLong,
          ErrorId.PasswordMalformed,
        ]).toString())
      })
      
      it('should not pass [PasswordMalformed]', async () => {
        const response = await postAuthorization({ email, password: 'aaaaaaaa' })
        expect(response.status).toStrictEqual(400)
        expect(response.body.message).toStrictEqual(new BadRequestAPIError([ ErrorId.PasswordMalformed ]).toString())
      })
      
    })
    
    describe('2. findUserByEmail', () => {
      
      it('should not pass (no users in db)', async () => {
        const response = await postAuthorization(true)
        expect(response.status).toStrictEqual(401)
        expect(response.body.message).toStrictEqual(unauthorized.toString())
        expect(anonymizeErrorLoggerSpy).toHaveBeenCalledWith(
          `Replaced ${ new NotFoundAPIError() } with ${ unauthorized }`)
      })
      
      it('should not pass (users in db)', async () => {
        const user: User = { email: 'unknown_' + email }
        await UserModel.create(user as UserDocument)
        const response = await postAuthorization(true)
        expect(response.status).toStrictEqual(401)
        expect(response.body.message).toStrictEqual(unauthorized.toString())
        expect(anonymizeErrorLoggerSpy).toHaveBeenCalledWith(
          `Replaced ${ new NotFoundAPIError() } with ${ unauthorized }`)
      })
      
    })
    
    describe('3. validateUserPassword', () => {
      
      beforeAll(async () => {
        const user: User = { email, password: await bcrypt.hash(password, 10) }
        await UserModel.create(user as UserDocument)
      })
      
      it('should not pass', async () => {
        const response = await postAuthorization({ email, password: password + '!' })
        expect(response.status).toStrictEqual(401)
        expect(response.body.message).toStrictEqual(unauthorized.toString())
        expect(anonymizeErrorLoggerSpy).toHaveBeenCalledWith(
          `Replaced ${ new UnauthorizedAPIError(ErrorId.PasswordMismatch) } with ${ unauthorized }`)
      })
      
    })
    
    describe('4. authorize(UserAction.TokenAuthorizationCreate)', () => {
      
      it('should not pass', async () => {
        const response = await postAuthorization({ email, password })
        expect(response.status).toStrictEqual(401)
        expect(response.body.message).toStrictEqual(unauthorized.toString())
        expect(anonymizeErrorLoggerSpy).toHaveBeenCalledWith(
          `Replaced ${ new ForbiddenAPIError(ErrorId.ActionUnauthorized) } with ${ unauthorized }`)
      })
      
    })
    
    describe('5. createAuthorizationToken', () => {
      
      beforeAll(async () => {
        const userDocument = await UserModel.findOne({ email })
        assert(userDocument)
        userDocument.actions = [ UserAction.TokenAuthorizationCreate ]
        await userDocument.save()
      })
      
      it('should pass', async () => {
        const response = await postAuthorization({ email, password })
        expect(response.status).toStrictEqual(200)
        expect(typeof response.body.token).toBe('string')
        expect(anonymizeErrorLoggerSpy).not.toHaveBeenCalled()
        token = response.body.token
      })
      
    })
    
  })
  
  describe('/authorization delete', () => {
    
    describe('1. findUserByToken', () => {
      
      it('should not pass', async () => {
        const response = await deleteAuthorization()
        expect(response.status).toStrictEqual(400)
        expect(response.body.message).toStrictEqual(
          new BadRequestAPIError([ ErrorId.AuthorizationNotFound ]).toString())
      })
      
    })
    
    describe('2. authorize(UserAction.TokenAuthorizationDelete)', () => {
      
      it('should not pass', async () => {
        const response = await deleteAuthorization(true)
        expect(response.status).toStrictEqual(403)
        expect(response.body.message).toStrictEqual(new ForbiddenAPIError(ErrorId.ActionUnauthorized).toString())
      })
      
    })
    
    describe('3. deleteAuthorizationToken', () => {
      
      beforeAll(async () => {
        const userDocument = await UserModel.findOne({ email })
        assert(userDocument)
        assert(userDocument.actions)
        userDocument.actions.push(UserAction.TokenAuthorizationDelete)
        await userDocument.save()
      })
      
      it('should pass', async () => {
        const response = await deleteAuthorization(true)
        expect(response.status).toStrictEqual(200)
        expect(response.body.success).toStrictEqual(true)
      })
      
    })
    
  })
  
})
