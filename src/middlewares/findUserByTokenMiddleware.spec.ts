import mongoose from 'mongoose'
import { BadRequestAPIError, NotFoundAPIError, TokenDuration, TokenType, UnauthorizedAPIError } from '@/types'
import { connect, disconnect } from '~/helpers/db'
import { encodeToken } from '@/services/tokenService'
import { findUserByToken, findUserByTokenLogger } from './findUserByTokenMiddleware'
import { sleep } from '~/helpers/utils'
import { Token, TokenDocument, TokenModel, User, UserDocument, UserModel } from '@/models'

describe('findUserByToken middleware', () => {
  
  let request: any = {
    get: (h: string) => request.headers[h.toLowerCase()]
  }
  
  const email = 'test@test.com'
  const loggerPassSpy = jest.spyOn(findUserByTokenLogger, 'pass')
  const next = jest.fn()
  const response: any = {}
  
  beforeAll(async () => {
    await connect()
    const user: User = { email }
    const userDocument = await UserModel.create(user as UserDocument)
    const tokenWUser: Token = {
      type: TokenType.Authorization,
      token: 'token with user',
      userId: userDocument._id,
    }
    const tokenWoUser: Token = {
      type: TokenType.Authorization,
      token: 'token without user',
      userId: String(new mongoose.Types.ObjectId()),
    }
    const tokenWNoType: Token = {
      type: <TokenType.Authorization>'unknown',
      token: 'token with no type',
      userId: String(new mongoose.Types.ObjectId()),
    }
    await TokenModel.create(tokenWUser as TokenDocument)
    await TokenModel.create(tokenWoUser as TokenDocument)
    await TokenModel.create(tokenWNoType as TokenDocument)
  })
  
  afterAll(async () => {
    await disconnect()
  })
  
  beforeEach(() => {
    request.headers = {}
  })
  
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  it('should throw on empty authorization', async () => {
    await findUserByToken(request, response, next)
    expect(next).toHaveBeenCalledWith(new BadRequestAPIError([ 'authorizationNotFound' ]))
    request.headers['x-authorization'] = 'unknown'
    await findUserByToken(request, response, next)
    expect(next).toHaveBeenCalledWith(new BadRequestAPIError([ 'authorizationNotFound' ]))
  })
  
  it('should throw on malformed authorization', async () => {
    request.headers['x-authorization'] = 'Bearer malformed'
    await findUserByToken(request, response, next)
    expect(next).toHaveBeenCalledWith(new BadRequestAPIError([ 'authorizationMalformed' ]))
  })
  
  it('should throw on a expired authorization', async () => {
    request.headers['x-authorization'] = 'Bearer ' + encodeToken('token', <TokenDuration>'1s')
    await sleep(2)
    await findUserByToken(request, response, next)
    expect(next).toHaveBeenCalledWith(new BadRequestAPIError([ 'authorizationMalformed' ]))
  })
  
  it('should throw on a not found token', async () => {
    request.headers['x-authorization'] = 'Bearer ' + encodeToken('token', TokenDuration.Authorization)
    await findUserByToken(request, response, next)
    expect(next).toHaveBeenCalledWith(new NotFoundAPIError())
  })
  
  it('should throw on a token with no type', async () => {
    request.headers['x-authorization'] = 'Bearer ' + encodeToken('token with no type', TokenDuration.Authorization)
    await findUserByToken(request, response, next)
    expect(next).toHaveBeenCalledWith(new NotFoundAPIError())
  })
  
  it('should throw on a token without user', async () => {
    request.headers['x-authorization'] = 'Bearer ' + encodeToken('token without user', TokenDuration.Authorization)
    await findUserByToken(request, response, next)
    expect(next).toHaveBeenCalledWith(new UnauthorizedAPIError('userMandatory'))
  })
  
  it('should find a user', async () => {
    request.headers['x-authorization'] = 'Bearer ' + encodeToken('token with user', TokenDuration.Authorization)
    await findUserByToken(request, response, next)
    expect(next).toHaveBeenCalledWith()
    expect(loggerPassSpy).toHaveBeenCalledWith(`[User ${ email }] has been found`)
    expect(request.user).toBeInstanceOf(UserModel)
    expect(request.user.email).toStrictEqual(email)
  })
  
})
