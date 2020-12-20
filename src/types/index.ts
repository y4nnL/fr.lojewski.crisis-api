import * as mongoose from 'mongoose'
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
// Mongoose helpers

export type SchemaDefinition<T> = mongoose.SchemaDefinition &
  Record<keyof T,
    mongoose.SchemaTypeOptions<any>
    | Function
    | string
    | mongoose.Schema
    | mongoose.Schema[]
    | Array<mongoose.SchemaTypeOptions<any>>
    | Function[]
    | mongoose.SchemaDefinition
    | mongoose.SchemaDefinition[]>
export class SchemaClass<T> extends mongoose.Schema {
  methods: T
  constructor(definition?: mongoose.SchemaDefinition, methods?: T, options?: mongoose.SchemaOptions) {
    super(definition, options)
    this.methods = methods
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
  AuthorizationCreateRequestBody,
  AuthorizationCreateRequestHandler,
  AuthorizationCreateResponseBody,
  authorizationCreateValidation,
  AuthorizationDeleteRequestHandler,
  AuthorizationDeleteResponseBody,
  TokenDuration,
  TokenType,
} from '@/types/token'

export {
  UserAction,
} from '@/types/user'
