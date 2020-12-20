import * as error from '@/types/error'
import { castError } from './castErrorMiddleware'
import { NextFunction, Request, Response } from 'express'

const ValidationError = require('express-validation/lib/validation-error')

describe('castError middleware', () => {
  
  let next: NextFunction
  
  beforeEach(() => {
    next = <NextFunction>jest.fn()
  })
  
  it('should cast Error to APIError', () => {
    castError(new Error('Error'), <Request>{}, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(new error.APIError(500, 'Error'))
  })
  
  it('should let APIError pass through', () => {
    let apiError = new error.APIError(500, 'APIError')
    castError(apiError, <Request>{}, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(apiError)
  })
  
  it('should cast NotFoundAPIError to APIError', () => {
    let notFound = new error.NotFoundAPIError()
    castError(notFound, <Request>{}, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(new error.APIError(notFound.statusCode, ''))
  })
  
  it('should cast ForbiddenAPIError to APIError', () => {
    let forbidden = new error.ForbiddenAPIError()
    castError(forbidden, <Request>{}, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(new error.APIError(forbidden.statusCode, ''))
    forbidden = new error.ForbiddenAPIError(error.ErrorId.ActionUnauthorized)
    castError(forbidden, <Request>{}, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(new error.APIError(forbidden.statusCode, error.ErrorId.ActionUnauthorized))
  })
  
  it('should cast UnauthorizedAPIError to APIError', () => {
    let unauthorized = new error.UnauthorizedAPIError()
    castError(unauthorized, <Request>{}, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(new error.APIError(unauthorized.statusCode, ''))
    unauthorized = new error.ForbiddenAPIError(error.ErrorId.UserMandatory)
    castError(unauthorized, <Request>{}, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(new error.APIError(unauthorized.statusCode, error.ErrorId.UserMandatory))
  })
  
  it('should cast valid express-validation ValidationError to APIError', () => {
    const body = [
      { message: error.ErrorId.EmailRequired },
      { message: error.ErrorId.EmailMalformed },
    ]
    const validation = new ValidationError({ body }, { statusCode: 400 })
    castError(validation, <Request>{}, <Response>{}, next)
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
    castError(validation, <Request>{}, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(new error.BadRequestAPIError([ error.ErrorId.__Unknown__ ]))
  })
  
})
