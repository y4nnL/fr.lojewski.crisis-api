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
// Request handlers

export type EmailRequestBody = { email: string }
export type EmailRequestHandler = RequestHandler<{}, {}, EmailRequestBody>

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

////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////
// Exports

export {
  APIError,
  BadRequestAPIError,
  ErrorId,
  ForbiddenAPIError,
  NotFoundAPIError,
  UnauthorizedAPIError,
} from '@/types/error'

export {
  joiRequiredEmail,
  joiRequiredPassword,
} from '@/types/joi'

export {
  PingRequestHandler,
  PingResponseBody,
} from '@/types/monitoring'

export {
  authorization,
  TokenDuration,
  TokenType,
} from '@/types/token'

export {
  UserAction
} from '@/types/user'
