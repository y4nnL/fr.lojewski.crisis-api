import env from '@/utils/env'
import { APIError } from '@/types'
import { handleError, handleErrorLogger } from './handleErrorMiddleware'

describe('handleNotFound middleware', () => {
  
  let response: any
  
  const error = new APIError(500, 'error')
  const loggerErrorSpy = jest.spyOn(handleErrorLogger, 'error')
  const method = 'GET'
  const next = jest.fn()
  const request: any = { originalUrl: '/endpoint', method }
  
  beforeEach(() => {
    error.statusCode = 500
    error.stack = 'stack'
    response = {
      json: jest.fn(),
      status: (c: any) => response.statusCode = c
    }
  })
  
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  it('should set the json response and statusCode', () => {
    // @ts-ignore
    env['isProduction'] = false
    handleError(error, request, response, next)
    expect(response.statusCode).toStrictEqual(500)
    expect(response.json).toHaveBeenCalledWith({ message: error.toString(), stack: error.stack })
    expect(loggerErrorSpy.mock.calls).toEqual([
      [ `Finished ${ request.method } ${ request.originalUrl } ${ error }` ],
      [ error.stack ],
    ])
    // @ts-ignore
    env['isProduction'] = true
    error.statusCode = 404
    handleError(error, request, response, next)
    expect(response.statusCode).toStrictEqual(404)
    expect(response.json).toHaveBeenCalledWith({ message: error.toString() })
    expect(response.json).not.toHaveBeenCalledWith({ stack: error.stack })
    expect(response.isErrorHandled).toStrictEqual(true)
  })
  
  it('should have no stack', () => {
    error.stack = ''
    handleError(error, request, response, next)
    expect(response.statusCode).toStrictEqual(500)
    expect(response.json).toHaveBeenCalledWith({ message: error.toString() })
    expect(loggerErrorSpy.mock.calls).toEqual([
      [ `Finished ${ request.method } ${ request.originalUrl } ${ error }` ],
    ])
  })
  
  it('should never call the next function', () => {
    handleError(error, request, response, next)
    expect(next).not.toHaveBeenCalled()
  })
  
})
