import { ErrorId } from '@/types/error'
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

export const joiRequiredEmail =
  Joi
    .string()
    .required()
    .email()
    .messages({
      'any.required': ErrorId.EmailRequired,
      'string.email': ErrorId.EmailMalformed,
    })

export const joiRequiredPassword =
  Joi
    .string()
    .required()
    .regex(/[a-zA-Z0-9]{8,30}/)
    .messages({
      'any.required': ErrorId.PasswordRequired,
      'string.pattern.base': ErrorId.PasswordMalformed,
    })

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
// Environment

export interface Env {
  dbUri: string
  debug: boolean
  isDevelopment: boolean
  isProduction: boolean
  jwtSecret: string
  mode: string
  pathCert: string
  pathCertCA: string
  pathCertKey: string
  serverPort: number
  sshKeys: string[]
  sshKeysPath: string
}
