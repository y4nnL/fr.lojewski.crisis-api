import { authorize } from './authorizeMiddleware'
import { ForbiddenAPIError, UnauthorizedAPIError, UserAction } from '@/types'
import { UserModel } from '@/models/User'
import { userService } from '@/services'

describe('Authorize middleware', () => {
  
  let request: any
  let userMandatoryError = new UnauthorizedAPIError('userMandatory')
  let unauthorizedActionError = new ForbiddenAPIError('actionUnauthorized')
  
  const next = jest.fn()
  const response: any = {}
  
  beforeEach(() => {
    request = {}
  })
  
  afterEach(() => {
    next.mockClear()
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
