import * as mongoose from 'mongoose'
import { RequestHandler } from 'express'

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
    if (methods) {
      this.methods = methods
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

export * from '@/types/error'
export * from '@/types/express'
export * from '@/types/joi'
export * from '@/types/monitoring'
export * from '@/types/token'
export * from '@/types/user'
