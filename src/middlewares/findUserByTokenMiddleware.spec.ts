import mongoose from 'mongoose'
import { BadRequestAPIError, ErrorId, NotFoundAPIError, TokenDuration, TokenType, UnauthorizedAPIError } from '@/types'
import { connect, disconnect } from '@/core/db'
import { encodeToken } from '@/services/tokenService'
import { findUserByToken, findUserByTokenLogger } from './findUserByTokenMiddleware'
import { NextFunction, Request, Response } from 'express'
import { Request as MockRequest } from 'jest-express/lib/request'
import { Token, TokenDocument, TokenModel, User, UserDocument, UserModel } from '@/models'

describe('findUserByToken middleware', () => {
  
  let next: NextFunction
  let request: MockRequest
  
  const email = 'test@test.com'
  const loggerErrorSpy = jest.spyOn(findUserByTokenLogger, 'error')
  const loggerPassSpy = jest.spyOn(findUserByTokenLogger, 'pass')
  const response = <Response>{}
  const sleep = async (time: number) => await new Promise((resolve) => setTimeout(resolve, time * 1000))
  const unauthorized = new UnauthorizedAPIError()
  
  beforeAll(async () => {
    await connect()
    const user: User = { email }
    const userDocument = await UserModel.create(user as UserDocument)
    const tokenWUser: Token = {
      type: TokenType.Authorization,
      token: 'token with user',
      userId: userDocument._id
    }
    const tokenWoUser: Token = {
      type: TokenType.Authorization,
      token: 'token without user',
      userId: String(new mongoose.Types.ObjectId())
    }
    const tokenWNoType: Token = {
      type: <TokenType.Authorization>'unknown',
      token: 'token with no type',
      userId: String(new mongoose.Types.ObjectId())
    }
    await TokenModel.create(tokenWUser as TokenDocument)
    await TokenModel.create(tokenWoUser as TokenDocument)
    await TokenModel.create(tokenWNoType as TokenDocument)
  })
  
  afterAll(async () => {
    await disconnect()
  })
  
  beforeEach(() => {
    jest.resetAllMocks()
    next = jest.fn()
    request = new MockRequest()
    request.get = (h: string) => request.headers[h.toLowerCase()]
  })
  
  it('should throw on empty authorization', async () => {
    await findUserByToken(<Request><any>request, response, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    expect(loggerErrorSpy).toHaveBeenCalledWith(new BadRequestAPIError([ ErrorId.AuthorizationNotFound ]))
    jest.resetAllMocks()
    request.setHeaders('X-Authorization', 'unknown')
    await findUserByToken(<Request><any>request, response, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    expect(loggerErrorSpy).toHaveBeenCalledWith(new BadRequestAPIError([ ErrorId.AuthorizationNotFound ]))
  })
  
  it('should throw on malformed authorization', async () => {
    request.setHeaders('X-Authorization', 'Bearer malformed')
    await findUserByToken(<Request><any>request, response, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    expect(loggerErrorSpy).toHaveBeenCalledWith(new BadRequestAPIError([ ErrorId.AuthorizationMalformed ]))
  })
  
  it('should throw on a expired authorization', async () => {
    request.setHeaders('X-Authorization', 'Bearer ' + encodeToken('token', '1s'))
    await sleep(2)
    await findUserByToken(<Request><any>request, response, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    expect(loggerErrorSpy).toHaveBeenCalledWith(new BadRequestAPIError([ ErrorId.AuthorizationMalformed ]))
  })
  
  it('should throw on a not found token', async () => {
    request.setHeaders('X-Authorization', 'Bearer ' + encodeToken('token', TokenDuration.Authorization))
    await findUserByToken(<Request><any>request, response, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    expect(loggerErrorSpy).toHaveBeenCalledWith(new NotFoundAPIError())
  })
  
  it('should throw on a token with no type', async () => {
    request.setHeaders('X-Authorization', 'Bearer ' + encodeToken('token with no type', TokenDuration.Authorization))
    await findUserByToken(<Request><any>request, response, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    expect(loggerErrorSpy).toHaveBeenCalledWith(new NotFoundAPIError())
  })
  
  it('should throw on a token without user', async () => {
    request.setHeaders('X-Authorization', 'Bearer ' + encodeToken('token without user', TokenDuration.Authorization))
    await findUserByToken(<Request><any>request, response, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    expect(loggerErrorSpy).toHaveBeenCalledWith(new UnauthorizedAPIError(ErrorId.UserMandatory))
  })
  
  it('should find a user', async () => {
    const req = <Request><any>request
    request.setHeaders('X-Authorization', 'Bearer ' + encodeToken('token with user', TokenDuration.Authorization))
    await findUserByToken(req, response, next)
    expect(next).toHaveBeenCalledWith()
    expect(loggerErrorSpy).not.toHaveBeenCalled()
    expect(loggerPassSpy).toHaveBeenCalled()
    expect(req.user).toBeInstanceOf(UserModel)
    expect(req.user?.email).toStrictEqual(email)
  })
  
})
