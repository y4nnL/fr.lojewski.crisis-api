import httpStatus from 'http-status'

export class APIError extends Error {
  
  name = 'APIError'
  message: string
  statusCode: number
  
  constructor(statusCode: number, message?: string) {
    super(message)
    this.statusCode = statusCode
  }
  
  toString(): string {
    return `[${ this.name } (${ this.statusCode }): ${ this.message }]`
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

export enum ErrorId {
  UnauthorizedAction = 'UnauthorizedAction',
  UserMandatory = 'UserMandatory',
}
