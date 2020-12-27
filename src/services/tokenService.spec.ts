import bcrypt from 'bcrypt'
import env from '@/utils/env'
import jwt from 'jsonwebtoken'
import mongoose from 'mongoose'
import * as service from '@/services/tokenService'
import { connect, disconnect } from '~/helpers/db'
import { decodeToken } from '@/services/tokenService'
import { ErrorId, TokenDuration, TokenType, UnauthorizedAPIError } from '@/types'
import { TokenDocument, TokenModel, User, UserDocument, UserModel } from '@/models'

describe('token service', () => {
  
  const loggerErrorSpy = jest.spyOn(service.tokenLogger, 'error')
  const loggerPassSpy = jest.spyOn(service.tokenLogger, 'pass')
  const next = jest.fn()
  const sleep = async (time: number) => await new Promise((resolve) => setTimeout(resolve, time * 1000))
  const unauthorized = new UnauthorizedAPIError()
  
  const response: any = {
    json: jest.fn(),
    status(c: any) {
      this.statusCode = c
      return this
    },
  }
  
  const userDocument: Promise<UserDocument> = (async () => {
    const user: User = {
      email: 'test@test.com',
      password: await bcrypt.hash('password', 10),
    }
    const userDocument = new UserModel(user as UserDocument)
    userDocument._id = new mongoose.Types.ObjectId()
    return Promise.resolve(userDocument)
  })()
  
  beforeAll(async () => {
    await connect()
    await TokenModel.deleteMany().exec()
  })
  
  afterAll(async () => {
    await disconnect()
  })
  
  beforeEach(async () => {
    jest.resetAllMocks()
    // @ts-ignore
    env['jwtSecret'] = 'secret'
    response.status(0)
    await TokenModel.deleteMany().exec()
  })
  
  describe('::encodeToken', () => {
    
    it('should encode', () => {
      const encodedToken = service.encodeToken('token', TokenDuration.Authorization)
      const decodedToken: any = jwt.decode(encodedToken)
      expect(typeof encodedToken).toStrictEqual('string')
      expect(decodedToken.token).toStrictEqual('token')
      expect(typeof decodedToken.iat).toStrictEqual('number')
      expect(typeof decodedToken.exp).toStrictEqual('number')
      expect(decodedToken.exp > decodedToken.iat).toBeTruthy()
    })
    
  })
  
  describe('::decodeToken', () => {
    
    it('should not decode', async () => {
      expect(service.decodeToken('', TokenDuration.Authorization)).toStrictEqual(null)
      expect(service.decodeToken('encoded', TokenDuration.Authorization)).toStrictEqual(null)
      let encoded = jwt.sign({ mal: 'formed' }, env.jwtSecret, { expiresIn: TokenDuration.Authorization })
      expect(service.decodeToken(encoded, TokenDuration.Authorization)).toStrictEqual(null)
      encoded = service.encodeToken('token', TokenDuration.Authorization)
      // @ts-ignore
      env['jwtSecret'] = 'anotherSecret'
      expect(service.decodeToken(encoded, TokenDuration.Authorization)).toStrictEqual(null)
      encoded = service.encodeToken('token', <TokenDuration>'1s')
      await sleep(2)
      expect(service.decodeToken(encoded, TokenDuration.Authorization)).toStrictEqual(null)
    })
    
    it('should decode', async () => {
      const raw = 'token'
      const encoded = service.encodeToken(raw, TokenDuration.Authorization)
      expect(service.decodeToken(encoded, TokenDuration.Authorization)).toStrictEqual(raw)
    })
    
  })
  
  describe('::createAuthorizationToken', () => {
    
    it('should throw on a missing user', async () => {
      await service.createAuthorizationToken(<any>{}, response, next)
      expect(next).toHaveBeenCalledWith(unauthorized)
      expect(loggerErrorSpy).toHaveBeenCalledWith(new UnauthorizedAPIError(ErrorId.UserMandatory))
    })
    
    it('should throw on a password mismatch', async () => {
      const request: any = {
        user: { password: await bcrypt.hash('password', 10) },
        body: { password: 'mismatch' },
      }
      await service.createAuthorizationToken(request, response, next)
      expect(next).toHaveBeenCalledWith(unauthorized)
      expect(loggerErrorSpy).toHaveBeenCalledWith(new UnauthorizedAPIError(ErrorId.PasswordMismatch))
    })
    
    it('should create an authorization token', async () => {
      const request: any = {
        user: await userDocument,
        body: { password: 'password' },
      }
      await service.createAuthorizationToken(request, response, next)
      expect(next).not.toHaveBeenCalled()
      expect(response.statusCode).toStrictEqual(200)
      expect(() => response.json.mock.calls[0][0].token).not.toThrow()
      const token = response.json.mock.calls[0][0].token
      expect(response.json).toHaveBeenCalledWith({ token })
      expect(loggerPassSpy).toHaveBeenCalledWith(`Created an authorization token for ${ request.user }`)
      const decodedToken = String(decodeToken(token, TokenDuration.Authorization))
      const document = await TokenModel.findOne({ token: decodedToken, type: TokenType.Authorization }).exec()
      expect(document).toBeTruthy()
    })
    
  })
  
  describe('::deleteAuthorizationToken', () => {
    
    it('should throw on a missing user', async () => {
      await service.deleteAuthorizationToken(<any>{}, response, next)
      expect(next).toHaveBeenCalledWith(unauthorized)
      expect(loggerErrorSpy).toHaveBeenCalledWith(new UnauthorizedAPIError(ErrorId.UserMandatory))
    })
    
    it('should delete authorization tokens', async () => {
      const request: any = { user: await userDocument }
      const userId = request.user._id
      await TokenModel.create({
        token: 'token',
        type: TokenType.Authorization,
        userId,
      } as TokenDocument)
      await TokenModel.create({
        token: 'token',
        type: <TokenType.Authorization>'anotherType',
        userId,
      } as TokenDocument)
      expect((await TokenModel.find({ userId }).exec()).length).toStrictEqual(2)
      await service.deleteAuthorizationToken(request, response, next)
      expect(next).not.toHaveBeenCalled()
      expect(response.statusCode).toStrictEqual(200)
      expect(response.json).toHaveBeenCalledWith({ success: true })
      expect(loggerPassSpy).toHaveBeenCalledWith(`Deleted all the authorization tokens for ${ request.user }`)
      const token = await TokenModel.find({ userId }).exec()
      expect(token.length).toStrictEqual(1)
      expect(token[0].type).toStrictEqual('anotherType')
    })
    
  })
  
})



