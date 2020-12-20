import { authorize } from './authorizeMiddleware'
import { ErrorId, ForbiddenAPIError, UnauthorizedAPIError, UserAction } from '@/types'
import { NextFunction, Request, RequestHandler, Response } from 'express'
import { UserDocument, UserModel } from '@/models/User'

describe('Authorize middleware', () => {
  
  let next: NextFunction
  let userMandatoryError: UnauthorizedAPIError
  let unauthorizedActionError: ForbiddenAPIError
  
  beforeEach(() => {
    next = <NextFunction>jest.fn()
    userMandatoryError = new UnauthorizedAPIError(ErrorId.UserMandatory)
    unauthorizedActionError = new ForbiddenAPIError(ErrorId.ActionUnauthorized)
  })
  
  it('should expect a user', async () => {
    const handler = authorize(UserAction.MonitoringPing)
    await handler(<Request>{}, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(userMandatoryError)
    expect(next).toHaveBeenCalledWith(expect.objectContaining({ message: userMandatoryError.message }))
  })
  
  describe('on single action', () => {
  
    let handler: RequestHandler
    
    beforeEach(() => {
      handler = authorize(UserAction.MonitoringPing)
    })
    
    it('should not authorize a user', async () => {
      const user: UserDocument = new UserModel({
        email: 'test',
        actions: [
          UserAction.TokenAuthorizationCreate
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
          UserAction.MonitoringPing
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
        UserAction.MonitoringPing,
        UserAction.TokenAuthorizationCreate,
        UserAction.TokenAuthorizationDelete,
      )
    })
    
    it('should not authorize a user', async () => {
      const user: UserDocument = new UserModel({
        email: 'test',
        actions: [
          UserAction.MonitoringPing
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
          UserAction.MonitoringPing,
          UserAction.TokenAuthorizationCreate,
          UserAction.TokenAuthorizationDelete,
        ],
      })
      await handler(<Request>{ user }, <Response>{}, next)
      expect(next).toHaveBeenCalledWith()
    })
  
  })
  
  // non-regression tests
  
  it('multiple calls should not grow actions array', async () => {
    let handler: RequestHandler = authorize(UserAction.MonitoringPing)
    const user: UserDocument = new UserModel({
      email: 'test',
      actions: [
        UserAction.MonitoringPing
      ],
    })
    jest.spyOn(user, 'canPerform')
    await handler(<Request>{ user }, <Response>{}, next)
    await handler(<Request>{ user }, <Response>{}, next)
    await handler(<Request>{ user }, <Response>{}, next)
    await handler(<Request>{ user }, <Response>{}, next)
    await handler(<Request>{ user }, <Response>{}, next)
    expect(user.canPerform).toHaveBeenCalledTimes(5)
  })
  
})
