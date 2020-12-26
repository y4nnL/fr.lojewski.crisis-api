import * as error from '@/types/error'
import { castError } from './castErrorMiddleware'

const ValidationError = require('express-validation/lib/validation-error')

describe('castError middleware', () => {
  
  const next: any = jest.fn()
  const request: any = {}
  const response: any = {}
  
  it('should cast Error to APIError', () => {
    castError(new Error('Error'), request, response, next)
    expect(next).toHaveBeenCalledWith(new error.APIError(500, 'Error'))
  })
  
  it('should let APIError pass through', () => {
    let apiError = new error.APIError(500, 'APIError')
    castError(apiError, request, response, next)
    expect(next).toHaveBeenCalledWith(apiError)
  })
  
  it('should cast NotFoundAPIError to APIError', () => {
    let notFound = new error.NotFoundAPIError()
    castError(notFound, request, response, next)
    expect(next).toHaveBeenCalledWith(new error.APIError(notFound.statusCode, ''))
  })
  
  it('should cast ForbiddenAPIError to APIError', () => {
    const forbidden = new error.ForbiddenAPIError(error.ErrorId.ActionUnauthorized)
    castError(forbidden, request, response, next)
    expect(next).toHaveBeenCalledWith(new error.APIError(forbidden.statusCode, error.ErrorId.ActionUnauthorized))
  })
  
  it('should cast UnauthorizedAPIError to APIError', () => {
    const unauthorized = new error.ForbiddenAPIError(error.ErrorId.UserMandatory)
    castError(unauthorized, request, response, next)
    expect(next).toHaveBeenCalledWith(new error.APIError(unauthorized.statusCode, error.ErrorId.UserMandatory))
  })
  
  it('should cast valid express-validation ValidationError to APIError', () => {
    const body = [
      { message: error.ErrorId.EmailRequired },
      { message: error.ErrorId.EmailMalformed },
    ]
    const validation = new ValidationError({ body }, { statusCode: 400 })
    castError(validation, request, response, next)
    expect(next).toHaveBeenCalledWith(new error.BadRequestAPIError([
      error.ErrorId.EmailRequired,
      error.ErrorId.EmailMalformed,
    ]))
    expect(next).not.toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining(error.ErrorId.__Unknown__) }))
  })
  
  it('should cast invalid express-validation ValidationError to APIError', () => {
    const body = [ { message: 'invalid' } ]
    const validation = new ValidationError({ body }, { statusCode: 400 })
    castError(validation, request, response, next)
    expect(next).toHaveBeenCalledWith(new error.BadRequestAPIError([ error.ErrorId.__Unknown__ ]))
  })
  
})
