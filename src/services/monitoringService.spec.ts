import { monitoringLogger, ping } from '@/services/monitoringService'
import { ErrorId, UnauthorizedAPIError } from '@/types'
import { UserModel } from '@/models'

describe('monitoring service', () => {
  
  const loggerPassSpy = jest.spyOn(monitoringLogger, 'pass')
  const next = jest.fn()
  const response: any = {
    json: jest.fn(),
    status(c: any) {
      this.statusCode = c
      return this
    },
  }
  
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  describe('::ping', () => {
    
    it('should not ping', async () => {
      ping(<any>{}, response, next)
      expect(next).toHaveBeenCalledWith(new UnauthorizedAPIError(ErrorId.UserMandatory))
      expect(response.statusCode).not.toStrictEqual(200)
      expect(response.json).not.toHaveBeenCalled()
    })
    
    it('should ping', async () => {
      const request: any = { user: new UserModel({ email: 'test' }) }
      ping(request, response, next)
      expect(next).not.toHaveBeenCalled()
      expect(response.statusCode).toStrictEqual(200)
      expect(response.json).toHaveBeenCalledWith({ pong: true })
      expect(loggerPassSpy).toHaveBeenCalledWith(`${ request.user } ping OK`)
    })
    
  })
  
})



