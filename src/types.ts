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
  
  //////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
  // Request handlers
  
  export type AuthorizationCreateRequestBody = { email: string, password: string }
  export type AuthorizationCreateResponseBody = { token: string }
  export type AuthorizationCreateRequestHandler =
    RequestHandler<{}, AuthorizationCreateResponseBody, AuthorizationCreateRequestBody>
  
  export type AuthorizationDeleteResponseBody = { success: true }
  export type AuthorizationDeleteRequestHandler = RequestHandler<{}, AuthorizationDeleteResponseBody, {}>
  
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
    MonitoringPing = 'monitoring:ping',
    TokenAuthorizationCreate = 'token:authorization:create',
    TokenAuthorizationDelete = 'token:authorization:delete',
  }
  
}
