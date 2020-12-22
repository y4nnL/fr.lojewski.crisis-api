import { BadRequestAPIError, ErrorId, NotFoundAPIError, UnauthorizedAPIError } from '@/types'
import { connect, disconnect } from '@/core/db'
import { findUserByEmail, findUserByEmailLogger } from './findUserByEmailMiddleware'
import { NextFunction, Request, Response } from 'express'
import { User, UserDocument, UserModel } from '@/models/User'

describe('findUserByEmail middleware', () => {
  
  let next: NextFunction
  
  const email = 'test@test.com'
  const loggerErrorSpy = jest.spyOn(findUserByEmailLogger, 'error')
  const loggerPassSpy = jest.spyOn(findUserByEmailLogger, 'pass')
  const response = <Response>{}
  const unauthorized = new UnauthorizedAPIError()
  
  beforeAll(async () => {
    await connect()
    await UserModel.create({ email } as User as UserDocument)
  })
  
  afterAll(async () => {
    await disconnect()
  })
  
  beforeEach(() => {
    jest.resetAllMocks()
    next = jest.fn()
  })
  
  it('should throw on empty body', async () => {
    await findUserByEmail(<Request>{}, response, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    expect(loggerErrorSpy).toHaveBeenCalledWith(new BadRequestAPIError([ ErrorId.EmailRequired ]))
    await findUserByEmail(<Request>{ body: null }, response, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    expect(loggerErrorSpy).toHaveBeenCalledWith(new BadRequestAPIError([ ErrorId.EmailRequired ]))
    await findUserByEmail(<Request>{ body: {} }, response, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    expect(loggerErrorSpy).toHaveBeenCalledWith(new BadRequestAPIError([ ErrorId.EmailRequired ]))
  })
  
  it('should throw on not found user', async () => {
    const body = { email: 'unknown' }
    await findUserByEmail(<Request>{ body }, response, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    expect(loggerErrorSpy).toHaveBeenCalledWith(new NotFoundAPIError())
  })
  
  it('should find a user', async () => {
    const body = { email }
    const request = <Request>{ body }
    await findUserByEmail(request, response, next)
    expect(next).toHaveBeenCalledWith()
    expect(loggerErrorSpy).not.toHaveBeenCalled()
    expect(loggerPassSpy).toHaveBeenCalled()
    expect(request.user).toBeInstanceOf(UserModel)
    expect(request.user?.email).toStrictEqual(email)
  })
  
})
