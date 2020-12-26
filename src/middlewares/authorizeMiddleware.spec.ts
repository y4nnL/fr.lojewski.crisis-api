import { authorize } from './authorizeMiddleware'
import { ErrorId, ForbiddenAPIError, UnauthorizedAPIError, UserAction } from '@/types'
import { UserModel } from '@/models/User'
import { userService } from '@/services'

describe('Authorize middleware', () => {
  
  let request: any
  let userMandatoryError: UnauthorizedAPIError
  let unauthorizedActionError: ForbiddenAPIError
  
  const next: any = jest.fn()
  const response: any = {}
  
  beforeEach(() => {
    request = {}
    userMandatoryError = new UnauthorizedAPIError(ErrorId.UserMandatory)
    unauthorizedActionError = new ForbiddenAPIError(ErrorId.ActionUnauthorized)
  })
  
  it('should expect a user', async () => {
    await authorize(UserAction.MonitoringPing)(request, response, next)
    expect(next).toHaveBeenCalledWith(userMandatoryError)
  })
  
  describe('on single action', () => {
    
    let handler: any
    
    beforeEach(() => {
      handler = authorize(UserAction.MonitoringPing)
    })
    
    it('should not authorize a user', async () => {
      request.user = new UserModel({
        email: 'test',
        actions: [ UserAction.TokenAuthorizationCreate ],
      })
      await handler(request, response, next)
      expect(next).toHaveBeenCalledWith(unauthorizedActionError)
    })
    
    it('should authorize a user', async () => {
      request.user = new UserModel({
        email: 'test',
        actions: [ UserAction.MonitoringPing ],
      })
      await handler(request, response, next)
      expect(next).toHaveBeenCalledWith()
    })
    
  })
  
  describe('on multiple actions', () => {
    
    let handler: any
    
    beforeEach(() => {
      handler = authorize(
        UserAction.MonitoringPing,
        UserAction.TokenAuthorizationCreate,
        UserAction.TokenAuthorizationDelete,
      )
    })
    
    it('should not authorize a user', async () => {
      request.user = new UserModel({
        email: 'test',
        actions: [ UserAction.MonitoringPing ],
      })
      await handler(request, response, next)
      expect(next).toHaveBeenCalledWith(unauthorizedActionError)
    })
    
    it('should authorize a user', async () => {
      request.user = new UserModel({
        email: 'test',
        actions: [
          UserAction.MonitoringPing,
          UserAction.TokenAuthorizationCreate,
          UserAction.TokenAuthorizationDelete,
        ],
      })
      await handler(request, response, next)
      expect(next).toHaveBeenCalledWith()
    })
    
  })
  
  // non-regression tests
  
  it('multiple calls should not grow actions array', async () => {
    const handler = authorize(UserAction.MonitoringPing)
    const canUserPerformSpy = jest.spyOn(userService, 'canUserPerform')
    request.user = new UserModel({
      email: 'test',
      actions: [ UserAction.MonitoringPing ],
    })
    await handler(request, response, next)
    await handler(request, response, next)
    await handler(request, response, next)
    await handler(request, response, next)
    await handler(request, response, next)
    expect(canUserPerformSpy).toHaveBeenCalledTimes(5)
  })
  
})
