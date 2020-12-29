import bcrypt from 'bcrypt'
import { BadRequestAPIError, ErrorId, UnauthorizedAPIError } from '@/types'
import { validateUserPassword, validateUserPasswordLogger } from './validateUserPasswordMiddleware'

describe('validateUserPassword middleware', () => {
  
  let request: any = {}
  
  const loggerPassSpy = jest.spyOn(validateUserPasswordLogger, 'pass')
  const next = jest.fn()
  const password = 'password'
  const response: any = {}
  
  beforeEach(() => {
    request = {}
  })
  
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  it('should throw on no valid body password', async () => {
    request.body = { password: 42 }
    await validateUserPassword(request, response, next)
    expect(next).toHaveBeenCalledWith(new BadRequestAPIError([ ErrorId.PasswordRequired ]))
  })
  
  it('should throw on no user', async () => {
    request.body = { password }
    await validateUserPassword(request, response, next)
    expect(next).toHaveBeenCalledWith(new UnauthorizedAPIError(ErrorId.UserMandatory))
  })
  
  it('should throw if the user has no password', async () => {
    request.body = { password }
    request.user = {}
    await validateUserPassword(request, response, next)
    expect(next).toHaveBeenCalledWith(new UnauthorizedAPIError(ErrorId.PasswordMismatch))
  })
  
  it('should throw on simple password mismatch', async () => {
    request.body = { password }
    request.user = { password: '42' }
    await validateUserPassword(request, response, next)
    expect(next).toHaveBeenCalledWith(new UnauthorizedAPIError(ErrorId.PasswordMismatch))
  })
  
  it('should throw on non-encrypted password mismatch', async () => {
    request.body = { password }
    request.user = { password }
    await validateUserPassword(request, response, next)
    expect(next).toHaveBeenCalledWith(new UnauthorizedAPIError(ErrorId.PasswordMismatch))
  })
  
  it('should validate the user encrypted password', async () => {
    request.body = { password }
    request.user = {
      password: await bcrypt.hash(password, 10),
      toString: () => '[User]',
    }
    await validateUserPassword(request, response, next)
    expect(next).toHaveBeenCalledWith()
    expect(loggerPassSpy).toHaveBeenCalledWith(`Password OK for ${ request.user }`)
  })
  
})
