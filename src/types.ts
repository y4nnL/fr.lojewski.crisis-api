import { Joi } from 'express-validation'
import { RequestHandler } from 'express'

import { UserDocument } from './mongo'

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
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Request handlers
  
  export type CreateAuthorizationRequestBody = { email: string, password: string }
  export type CreateAuthorizationResponseBody = { token: string }
  export type CreateAuthorizationRequestHandler =
    RequestHandler<{}, CreateAuthorizationResponseBody, CreateAuthorizationRequestBody>
  
  export type DeleteAuthorizationResponseBody = { success: true }
  export type DeleteAuthorizationRequestHandler = RequestHandler<{}, DeleteAuthorizationResponseBody, {}>
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Validations
  
  export const createValidation = {
    body: Joi.object({
      email: joiRequiredEmail,
      password: joiRequiredPassword,
    }),
  }
  
}

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// User

export namespace User {
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Helpers
  
  export enum Action {
    CreateAuthorizationToken = 'token:create:authorization',
    Ping = 'ping',
    
    ah = 'ah',
    bhe = 'bhe',
  }
  
}
