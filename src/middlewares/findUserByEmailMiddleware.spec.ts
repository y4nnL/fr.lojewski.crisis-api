import { BadRequestAPIError, ErrorId, NotFoundAPIError } from '@/types'
import { connect, disconnect } from '~/helpers/db'
import { findUserByEmail, findUserByEmailLogger } from './findUserByEmailMiddleware'
import { User, UserDocument, UserModel } from '@/models/User'

describe('findUserByEmail middleware', () => {
  
  let request: any
  
  const email = 'test@test.com'
  const loggerPassSpy = jest.spyOn(findUserByEmailLogger, 'pass')
  const next = jest.fn()
  const response: any = {}
  
  beforeAll(async () => {
    await connect()
    await UserModel.create({ email } as User as UserDocument)
  })
  
  afterAll(async () => {
    await disconnect()
  })
  
  beforeEach(() => {
    request = {}
  })
  
  afterEach(() => {
    next.mockClear()
  })
  
  it('should throw on empty body', async () => {
    await findUserByEmail(request, response, next)
    expect(next).toHaveBeenCalledWith(new BadRequestAPIError([ ErrorId.EmailRequired ]))
    request.body = null
    await findUserByEmail(request, response, next)
    expect(next).toHaveBeenCalledWith(new BadRequestAPIError([ ErrorId.EmailRequired ]))
    request.body = {}
    await findUserByEmail(request, response, next)
    expect(next).toHaveBeenCalledWith(new BadRequestAPIError([ ErrorId.EmailRequired ]))
  })
  
  it('should throw on not found user', async () => {
    request.body = { email: 'unknown' }
    await findUserByEmail(request, response, next)
    expect(next).toHaveBeenCalledWith(new NotFoundAPIError())
  })
  
  it('should find a user', async () => {
    request.body = { email }
    await findUserByEmail(request, response, next)
    expect(next).toHaveBeenCalledWith()
    expect(loggerPassSpy).toHaveBeenCalled()
    expect(request.user).toBeInstanceOf(UserModel)
    expect(request.user?.email).toStrictEqual(email)
  })
  
})
