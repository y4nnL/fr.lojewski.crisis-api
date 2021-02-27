import * as error from '@/types/error'
import { castError } from './castErrorMiddleware'

const ValidationError = require('express-validation/lib/validation-error')

describe('castError middleware', () => {
  
  const next: any = jest.fn()
  const request: any = {}
  const response: any = {}
  const unknownErrorId: error.ErrorId = '__unknown__'
  
  it('should cast Error to APIError', () => {
    castError(null, request, response, next)
    expect(next).toHaveBeenCalledWith(new error.APIError(500, ''))
    castError('Error', request, response, next)
    expect(next).toHaveBeenCalledWith(new error.APIError(500, 'Error'))
    castError({ message: 'Error' }, request, response, next)
    expect(next).toHaveBeenCalledWith(new error.APIError(500, 'Error'))
    castError(new Error('Error'), request, response, next)
    expect(next).toHaveBeenCalledWith(new error.APIError(500, 'Error'))
    // types/error.ts coverage
    expect(new error.APIError(500, '').toString()).toStrictEqual('[APIError (500)]')
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
    const forbidden = new error.ForbiddenAPIError('actionUnauthorized')
    castError(forbidden, request, response, next)
    expect(next).toHaveBeenCalledWith(new error.APIError(forbidden.statusCode, 'actionUnauthorized'))
  })
  
  it('should cast UnauthorizedAPIError to APIError', () => {
    const unauthorized = new error.ForbiddenAPIError('userMandatory')
    castError(unauthorized, request, response, next)
    expect(next).toHaveBeenCalledWith(new error.APIError(unauthorized.statusCode, 'userMandatory'))
  })
  
  it('should cast valid express-validation ValidationError to APIError', () => {
    const body = [
      { message: 'emailRequired' },
      { message: 'emailMalformed' },
    ]
    const validation = new ValidationError({ body }, { statusCode: 400 })
    castError(validation, request, response, next)
    expect(next).toHaveBeenCalledWith(new error.BadRequestAPIError([
      'emailRequired',
      'emailMalformed',
    ]))
    expect(next).not.toHaveBeenCalledWith(
      expect.objectContaining({ message: expect.stringContaining(unknownErrorId) }))
  })
  
  it('should cast invalid express-validation ValidationError to APIError', () => {
    const body = [ { message: 'invalid' } ]
    const validation = new ValidationError({ body }, { statusCode: 400 })
    castError(validation, request, response, next)
    expect(next).toHaveBeenCalledWith(new error.BadRequestAPIError([ unknownErrorId ]))
  })
  
  it('should cast no body express-validation ValidationError to APIError', () => {
    const validation = new ValidationError({}, { statusCode: 400 })
    castError(validation, request, response, next)
    expect(next).toHaveBeenCalledWith(new error.BadRequestAPIError([]))
  })
  
})
