import { anonymizeError, anonymizeErrorLogger } from '@/middlewares/anonymizeErrorMiddleware'
import { APIError, BadRequestAPIError, ErrorId, ForbiddenAPIError, UnauthorizedAPIError } from '@/types/error'

describe('anonymizeError middleware', () => {
  
  const anonymousError = new APIError(500, 'Error')
  const loggerPassSpy = jest.spyOn(anonymizeErrorLogger, 'pass')
  const next = jest.fn()
  const nextList = [ jest.fn(), jest.fn(), jest.fn() ]
  
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  describe('as a single middleware', () => {
  
    it('should not next at all', () => {
      const handler = anonymizeError(anonymousError, () => {})
      handler(<any>{}, <any>{}, next)
      expect(next).not.toHaveBeenCalled()
      expect(loggerPassSpy).not.toHaveBeenCalled()
    })
  
    it('should not next any errors', () => {
      const handler = anonymizeError(anonymousError, ({}, {}, localNext) => { localNext() })
      handler(<any>{}, <any>{}, next)
      expect(next).toHaveBeenCalledWith()
      expect(loggerPassSpy).not.toHaveBeenCalled()
    })
  
    it('should next the anonymous error', () => {
      const error = new UnauthorizedAPIError(ErrorId.ActionUnauthorized)
      const handler = anonymizeError(anonymousError, ({}, {}, localNext) => { localNext(error) })
      handler(<any>{}, <any>{}, next)
      expect(next).toHaveBeenCalledWith(anonymousError)
      expect(loggerPassSpy).toHaveBeenCalledWith(`Replaced ${ error } with ${ anonymousError }`)
    })
    
  })
  
  describe('as a middleware list', () => {
  
    it('should not next at all', () => {
      const handlers = anonymizeError(
        anonymousError,
        () => {},
        () => {},
        () => {},
      )
      handlers.forEach((handler, i) => handler(<any>{}, <any>{}, nextList[i]))
      expect(nextList[0]).not.toHaveBeenCalled()
      expect(nextList[1]).not.toHaveBeenCalled()
      expect(nextList[2]).not.toHaveBeenCalled()
      expect(loggerPassSpy).not.toHaveBeenCalled()
    })
  
    it('should not next any errors', () => {
      const handlers = anonymizeError(
        anonymousError,
        ({}, {}, localNext) => { localNext() },
        ({}, {}, localNext) => { localNext() },
        ({}, {}, localNext) => { localNext() },
      )
      handlers.forEach((handler, i) => handler(<any>{}, <any>{}, nextList[i]))
      expect(nextList[0]).toHaveBeenCalled()
      expect(nextList[1]).toHaveBeenCalled()
      expect(nextList[2]).toHaveBeenCalled()
      expect(loggerPassSpy).not.toHaveBeenCalled()
    })
  
    it('should next the anonymous error', () => {
      // In an express context, the second and third next functions would never be called
      const error1 = new UnauthorizedAPIError(ErrorId.ActionUnauthorized)
      const error2 = new ForbiddenAPIError()
      const error3 = new BadRequestAPIError([ErrorId.PasswordEmpty])
      const handlers = anonymizeError(
        anonymousError,
        ({}, {}, localNext) => { localNext(error1) },
        ({}, {}, localNext) => { localNext(error2) },
        ({}, {}, localNext) => { localNext(error3) },
      )
      handlers.forEach((handler, i) => handler(<any>{}, <any>{}, nextList[i]))
      expect(nextList[0]).toHaveBeenCalledWith(anonymousError)
      expect(nextList[1]).toHaveBeenCalledWith(anonymousError)
      expect(nextList[2]).toHaveBeenCalledWith(anonymousError)
      expect(loggerPassSpy.mock.calls).toEqual([
        [ `Replaced ${ error1 } with ${ anonymousError }` ],
        [ `Replaced ${ error2 } with ${ anonymousError }` ],
        [ `Replaced ${ error3 } with ${ anonymousError }` ]
      ])
    })
    
  })
  
})
