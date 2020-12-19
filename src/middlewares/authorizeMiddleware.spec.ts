import { authorize } from './authorizeMiddleware'
import { ErrorId, ForbiddenAPIError, UnauthorizedAPIError } from '@/types/error'
import { NextFunction, Request, RequestHandler, Response } from 'express'
import { User } from '@/types'
import { UserDocument, UserModel } from '@/models/User'

describe('Authorize middleware', () => {
  
  let next: NextFunction
  let userMandatoryError: UnauthorizedAPIError
  let unauthorizedActionError: ForbiddenAPIError
  
  beforeEach(() => {
    next = <NextFunction>jest.fn()
    userMandatoryError = new UnauthorizedAPIError(ErrorId.UserMandatory)
    unauthorizedActionError = new ForbiddenAPIError(ErrorId.UnauthorizedAction)
  })
  
  it('should expect a user', async () => {
    const handler = authorize(User.Action.MonitoringPing)
    await handler(<Request>{}, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(userMandatoryError)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: userMandatoryError.message }))
  })
  
  describe('on single action', () => {
  
    let handler: RequestHandler
    
    beforeEach(() => {
      handler = authorize(User.Action.MonitoringPing)
    })
    
    it('should not authorize a user', async () => {
      const user: UserDocument = new UserModel({
        email: 'test',
        actions: [
          User.Action.TokenAuthorizationCreate
        ],
      })
      await handler(<Request>{ user }, <Response>{}, next)
      expect(next).toHaveBeenCalledWith(unauthorizedActionError)
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: unauthorizedActionError.message }))
    })
  
    it('should authorize a user', async () => {
      const user: UserDocument = new UserModel({
        email: 'test',
        actions: [
          User.Action.MonitoringPing
        ],
      })
      await handler(<Request>{ user }, <Response>{}, next)
      expect(next).toHaveBeenCalledWith()
    })
    
  })
  
  describe('on multiple actions', () => {
  
    let handler: RequestHandler
    
    beforeEach(() => {
      handler = authorize(
        User.Action.MonitoringPing,
        User.Action.TokenAuthorizationCreate,
        User.Action.TokenAuthorizationDelete,
      )
    })
    
    it('should not authorize a user', async () => {
      const user: UserDocument = new UserModel({
        email: 'test',
        actions: [
          User.Action.MonitoringPing
        ],
      })
      await handler(<Request>{ user }, <Response>{}, next)
      expect(next).toHaveBeenCalledWith(unauthorizedActionError)
      expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: unauthorizedActionError.message }))
    })
  
    it('should authorize a user', async () => {
      const user: UserDocument = new UserModel({
        email: 'test',
        actions: [
          User.Action.MonitoringPing,
          User.Action.TokenAuthorizationCreate,
          User.Action.TokenAuthorizationDelete,
        ],
      })
      await handler(<Request>{ user }, <Response>{}, next)
      expect(next).toHaveBeenCalledWith()
    })
  
  })
  
})
