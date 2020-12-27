import { BadRequestAPIError, ErrorId, NotFoundAPIError, UnauthorizedAPIError } from '@/types'
import { connect, disconnect } from '@/core/db'
import { findUserByEmail, findUserByEmailLogger } from './findUserByEmailMiddleware'
import { User, UserDocument, UserModel } from '@/models/User'

describe('findUserByEmail middleware', () => {
  
  let request: any
  
  const email = 'test@test.com'
  const loggerErrorSpy = jest.spyOn(findUserByEmailLogger, 'error')
  const loggerPassSpy = jest.spyOn(findUserByEmailLogger, 'pass')
  const next: any = jest.fn()
  const response: any = {}
  const unauthorized = new UnauthorizedAPIError()
  
  beforeAll(async () => {
    await connect()
    await UserModel.deleteMany().exec()
    await UserModel.create({ email } as User as UserDocument)
  })
  
  afterAll(async () => {
    await UserModel.deleteMany().exec()
    await disconnect()
  })
  
  beforeEach(() => {
    jest.resetAllMocks()
    request = {}
  })
  
  it('should throw on empty body', async () => {
    await findUserByEmail(request, response, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    expect(loggerErrorSpy).toHaveBeenCalledWith(new BadRequestAPIError([ ErrorId.EmailRequired ]))
    request.body = null
    await findUserByEmail(request, response, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    expect(loggerErrorSpy).toHaveBeenCalledWith(new BadRequestAPIError([ ErrorId.EmailRequired ]))
    request.body = {}
    await findUserByEmail(request, response, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    expect(loggerErrorSpy).toHaveBeenCalledWith(new BadRequestAPIError([ ErrorId.EmailRequired ]))
  })
  
  it('should throw on not found user', async () => {
    request.body = { email: 'unknown' }
    await findUserByEmail(request, response, next)
    expect(next).toHaveBeenCalledWith(unauthorized)
    expect(loggerErrorSpy).toHaveBeenCalledWith(new NotFoundAPIError())
  })
  
  it('should find a user', async () => {
    request.body = { email }
    await findUserByEmail(request, response, next)
    expect(next).toHaveBeenCalledWith()
    expect(loggerErrorSpy).not.toHaveBeenCalled()
    expect(loggerPassSpy).toHaveBeenCalled()
    expect(request.user).toBeInstanceOf(UserModel)
    expect(request.user?.email).toStrictEqual(email)
  })
  
})
