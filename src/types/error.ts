import httpStatus from 'http-status'

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

export enum ErrorId {
  __Unknown__ = '__Unknown__',
  ActionUnauthorized = 'ActionUnauthorized',
  AuthorizationMalformed = 'AuthorizationMalformed',
  AuthorizationNotFound = 'AuthorizationNotFound',
  EmailMalformed = 'EmailMalformed',
  EmailRequired = 'EmailRequired',
  PasswordMalformed = 'PasswordMalformed',
  PasswordRequired = 'PasswordRequired',
  SignatureUnknown = 'SignatureUnknown',
  SignatureNotFound = 'SignatureNotFound',
  SignatureNotVerified = 'SignatureNotVerified',
  UserMandatory = 'UserMandatory',
}
