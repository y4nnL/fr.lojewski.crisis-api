import httpStatus from 'http-status'
import { Joi } from 'express-validation'
import { RequestHandler } from 'express'

import { UserDocument } from '@/models/User'

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Express augmentation

declare global {
  
  namespace Express {
    
    interface Request {
      startTime?: Date
      user?: UserDocument
    }
    
    interface Response {
      isErrorHandled?: boolean
    }
    
  }
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Aliases

export const joiRequiredEmail = Joi.string().email().required()
export const joiRequiredPassword = Joi.string().regex(/[a-zA-Z0-9]{8,30}/).required()

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Global request handlers

export type EmailRequestBody = { email: string }
export type EmailRequestHandler = RequestHandler<{}, {}, EmailRequestBody>

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Monitoring

export namespace Monitoring {
  
  export type PingResponseBody = { pong: true }
  export type PingRequestHandler = RequestHandler<{}, PingResponseBody, {}>
  
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Token

export namespace Token {
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helpers
  
  export enum Duration {
    Authorization = '1w'
  }
  
  export enum Type {
    Authorization = 'authorization'
  }
  
  export namespace Authorization {
  
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Request handlers
  
    export type CreateRequestBody = { email: string, password: string }
    export type CreateResponseBody = { token: string }
    export type CreateRequestHandler =
      RequestHandler<{}, CreateResponseBody, CreateRequestBody>
  
    export type DeleteResponseBody = { success: true }
    export type DeleteRequestHandler = RequestHandler<{}, DeleteResponseBody, {}>
    
    ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
    // Validations
  
    export const createValidation = {
      body: Joi.object({
        email: joiRequiredEmail,
        password: joiRequiredPassword,
      }),
    }
    
  }
  
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// User

export namespace User {
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helpers
  
  export enum Action {
    MonitoringPing = 'monitoring:ping',
    TokenAuthorizationCreate = 'token:authorization:create',
    TokenAuthorizationDelete = 'token:authorization:delete',
  }
  
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Custom errors

export class APIError extends Error {
  
  message: string
  statusCode: number
  
  constructor(message: string, statusCode: number) {
    super()
    this.message = message
    this.statusCode = statusCode
  }
  
}

export class NotFoundAPIError extends APIError {
  
  constructor(contextMessage?: string) {
    contextMessage ?
      super(`${ httpStatus[404] } (${ contextMessage })`, 404) :
      super(httpStatus[404], 404)
  }
  
}

export class UnauthorizedAPIError extends APIError {
  
  constructor(contextMessage?: string) {
    contextMessage ?
      super(`${ httpStatus[401] } (${ contextMessage })`, 401) :
      super(httpStatus[401], 401)
  }
  
}
