import httpStatus from 'http-status'
import { StringUnion } from '@/utils/lib'

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Base class

export class APIError extends Error {
  
  name = 'APIError'
  message: string
  statusCode: number
  
  constructor(statusCode: number, message?: string) {
    super(message)
    this.statusCode = statusCode
  }
  
  toString(): string {
    const message = this.message ? ': ' + this.message : ''
    return `[${ this.name } (${ this.statusCode })${ message }]`
  }
  
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Specific classes

export class BadRequestAPIError extends APIError {
  constructor(errorId: ErrorId[]) {
    super(httpStatus.BAD_REQUEST, errorId.join(';'))
    this.name = 'BadRequestAPIError'
  }
}

export class UnauthorizedAPIError extends APIError {
  constructor(errorId?: ErrorId) {
    super(httpStatus.UNAUTHORIZED, errorId)
    this.name = 'UnauthorizedAPIError'
  }
}

export class ForbiddenAPIError extends APIError {
  
  constructor(errorId?: ErrorId) {
    super(httpStatus.FORBIDDEN, errorId)
    this.name = 'ForbiddenAPIError'
  }
}

export class NotFoundAPIError extends APIError {
  constructor() {
    super(httpStatus.NOT_FOUND)
    this.name = 'NotFoundAPIError'
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Messages

export const ErrorId = StringUnion(
  '__unknown__',
  'actionUnauthorized',
  'authorizationMalformed',
  'authorizationNotFound',
  'emailEmpty',
  'emailMalformed',
  'emailNotString',
  'emailRequired',
  'passwordEmpty',
  'passwordMalformed',
  'passwordMismatch',
  'passwordNotString',
  'passwordRequired',
  'passwordTooLong',
  'passwordTooShort',
  'signatureAlreadyVerified',
  'signatureMalformed',
  'signatureNotFound',
  'signatureNotVerified',
  'signatureUnknown',
  'userMandatory',
)

export type ErrorId = typeof ErrorId.type

