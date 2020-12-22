import env from '@/utils/env'
import { APIError } from '@/types'
import { handleError, handleErrorLogger } from './handleErrorMiddleware'
import { Request as MockRequest } from 'jest-express/lib/request'
import { Request, Response } from 'express'
import { Response as MockResponse } from 'jest-express/lib/response'

describe('handleNotFound middleware', () => {
  
  let request: MockRequest
  let response: MockResponse
  
  const error = new APIError(500, 'error')
  const method = 'GET'
  const next = jest.fn()
  const url = '/endpoint'
  
  beforeEach(() => {
    jest.resetAllMocks()
    error.statusCode = 500
    request = new MockRequest(url, { method })
    response = new MockResponse()
  })
  
  it('should set the json response and statusCode', () => {
    const jsonSpy = jest.spyOn(response, 'json')
    const loggerSpy = jest.spyOn(handleErrorLogger, 'error')
    env.isProduction = false
    handleError(error, <Request><any>request, <Response><any>response, next)
    expect(response.statusCode).toStrictEqual(500)
    expect(jsonSpy).toHaveBeenCalledWith({ message: error.message, stack: error.stack })
    expect(loggerSpy.mock.calls).toEqual([
      [ `Finished ${ request.method } ${ request.originalUrl } ${ error }` ],
      [ error.stack ],
    ])
    env.isProduction = true
    error.statusCode = 404
    handleError(error, <Request><any>request, <Response><any>response, next)
    expect(response.statusCode).toStrictEqual(404)
    expect(jsonSpy).toHaveBeenCalledWith({ message: error.message })
    expect(jsonSpy).not.toHaveBeenCalledWith({ stack: error.stack })
    expect(response.isErrorHandled).toStrictEqual(true)
  })
  
  it('should never call the next function', () => {
    handleError(error, <Request><any>request, <Response><any>response, next)
    expect(next).not.toHaveBeenCalled()
  })
  
})
