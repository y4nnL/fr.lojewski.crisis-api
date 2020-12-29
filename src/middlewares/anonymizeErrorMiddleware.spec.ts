import { anonymizeError, anonymizeErrorLogger } from '@/middlewares/anonymizeErrorMiddleware'
import { APIError, BadRequestAPIError, ErrorId, ForbiddenAPIError, UnauthorizedAPIError } from '@/types/error'

describe('anonymizeError middleware', () => {
  
  const anonymousError = new APIError(500, 'Error')
  const loggerErrorSpy = jest.spyOn(anonymizeErrorLogger, 'error')
  const next = jest.fn()
  const nextList = [ jest.fn(), jest.fn(), jest.fn() ]
  
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  describe('as a single middleware', () => {
  
    it('should not next at all', () => {
      const handler = anonymizeError(() => {}, anonymousError)
      handler(<any>{}, <any>{}, next)
      expect(next).not.toHaveBeenCalled()
      expect(loggerErrorSpy).not.toHaveBeenCalled()
    })
  
    it('should not next any errors', () => {
      const handler = anonymizeError(({}, {}, localNext) => { localNext() }, anonymousError)
      handler(<any>{}, <any>{}, next)
      expect(next).toHaveBeenCalledWith()
      expect(loggerErrorSpy).not.toHaveBeenCalled()
    })
  
    it('should next the anonymous error', () => {
      const error = new UnauthorizedAPIError(ErrorId.ActionUnauthorized)
      const handler = anonymizeError(({}, {}, localNext) => { localNext(error) }, anonymousError)
      handler(<any>{}, <any>{}, next)
      expect(next).toHaveBeenCalledWith(anonymousError)
      expect(loggerErrorSpy).toHaveBeenCalledWith(error)
    })
    
  })
  
  describe('as a list of middleware', () => {
  
    it('should not next at all', () => {
      const handlers = anonymizeError([
        () => {},
        () => {},
        () => {},
      ], anonymousError)
      handlers.forEach((handler, i) => handler(<any>{}, <any>{}, nextList[i]))
      expect(nextList[0]).not.toHaveBeenCalled()
      expect(nextList[1]).not.toHaveBeenCalled()
      expect(nextList[2]).not.toHaveBeenCalled()
      expect(loggerErrorSpy).not.toHaveBeenCalled()
    })
  
    it('should not next any errors', () => {
      const handlers = anonymizeError([
        ({}, {}, localNext) => { localNext() },
        ({}, {}, localNext) => { localNext() },
        ({}, {}, localNext) => { localNext() },
      ], anonymousError)
      handlers.forEach((handler, i) => handler(<any>{}, <any>{}, nextList[i]))
      expect(nextList[0]).toHaveBeenCalled()
      expect(nextList[1]).toHaveBeenCalled()
      expect(nextList[2]).toHaveBeenCalled()
      expect(loggerErrorSpy).not.toHaveBeenCalled()
    })
  
    it('should next the anonymous error', () => {
      // In an express context, the second and third next functions would never be called
      const error1 = new UnauthorizedAPIError(ErrorId.ActionUnauthorized)
      const error2 = new ForbiddenAPIError()
      const error3 = new BadRequestAPIError([ErrorId.PasswordEmpty])
      const handlers = anonymizeError([
        ({}, {}, localNext) => { localNext(error1) },
        ({}, {}, localNext) => { localNext(error2) },
        ({}, {}, localNext) => { localNext(error3) },
      ], anonymousError)
      handlers.forEach((handler, i) => handler(<any>{}, <any>{}, nextList[i]))
      expect(nextList[0]).toHaveBeenCalledWith(anonymousError)
      expect(nextList[1]).toHaveBeenCalledWith(anonymousError)
      expect(nextList[2]).toHaveBeenCalledWith(anonymousError)
      expect(loggerErrorSpy.mock.calls).toEqual([ [ error1 ], [ error2 ], [ error3 ] ])
    })
    
  })
  
})
