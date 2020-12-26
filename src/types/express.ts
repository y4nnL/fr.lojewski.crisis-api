import { UserDocument } from '@/models'
import { RequestHandler } from 'express'

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Augmentation

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
// Request & response types

export type AuthorizationCreateRequestBody = { email: string, password: string }
export type AuthorizationCreateResponseBody = { token: string }
export type AuthorizationCreateRequestHandler =
  RequestHandler<{}, AuthorizationCreateResponseBody, AuthorizationCreateRequestBody>

export type AuthorizationDeleteResponseBody = { success: true }
export type AuthorizationDeleteRequestHandler = RequestHandler<{}, AuthorizationDeleteResponseBody, {}>

export type EmailRequestBody = { email: string }
export type EmailRequestHandler = RequestHandler<{}, {}, EmailRequestBody>
