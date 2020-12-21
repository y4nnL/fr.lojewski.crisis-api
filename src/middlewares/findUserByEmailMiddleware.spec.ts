import { BadRequestAPIError, ErrorId, NotFoundAPIError, UnauthorizedAPIError } from '@/types'
import { connectDB } from '@/core/db'
import { findUserByEmail, findUserByEmailLogger } from './findUserByEmailMiddleware'
import { NextFunction, Request, Response } from 'express'
import { UserDocument, UserModel } from '@/models/User'

describe('findUserByEmail middleware', () => {
  
  let next: NextFunction
  const email = 'test@test.com'
  const unauthorized = new UnauthorizedAPIError()
  
  beforeAll(async () => {
    await connectDB()
    await UserModel.create({ email } as UserDocument)
  })
  
  beforeEach(() => {
    next = jest.fn()
    jest.resetAllMocks()
  })
  
  it('should throw on empty request or body', async () => {
    await findUserByEmail(<Request>{}, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    await findUserByEmail(<Request>{ body: null }, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    await findUserByEmail(<Request>{ body: {} }, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
  })
  
  it('should throw on not found user', async () => {
    const body: any = { email: 42 }
    await findUserByEmail(<Request>{ body }, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    body.email = [ 42, 42, 42 ]
    await findUserByEmail(<Request>{ body }, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    body.email = 'unknown'
    await findUserByEmail(<Request>{ body }, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
  })
  
  it('should silently fail to UnauthorizedAPIError', async () => {
    const body: any = { email: 'unknown' }
    const loggerSpy = jest.spyOn(findUserByEmailLogger, 'error')
    await findUserByEmail(<Request>{}, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    expect(loggerSpy).toHaveBeenCalledWith(new BadRequestAPIError([ ErrorId.EmailRequired ]))
    await findUserByEmail(<Request>{ body }, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    expect(loggerSpy).toHaveBeenCalledWith(new NotFoundAPIError())
  })
  
  it('should find a user', async () => {
    const body = { email }
    const request = <Request>{ body }
    await findUserByEmail(request, <Response>{}, next)
    expect(next).toHaveBeenCalledWith()
    expect(request.user).toBeInstanceOf(UserModel)
    expect(request.user.email).toStrictEqual(email)
  })
  
})
