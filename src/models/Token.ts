import mongoose from 'mongoose'
import { Document, Schema } from 'mongoose'
import { SchemaClass, SchemaDefinition, TokenType } from '@/types'

type Token = {
  token: string
  type: TokenType
  userId: string
}

const tokenDefinition: SchemaDefinition<Token> = {
  token: {
    type: Schema.Types.String,
    required: true,
  },
  type: {
    type: Schema.Types.String,
    required: true,
  },
  userId: {
    type: Schema.Types.ObjectId,
    required: true,
  },
}

type TokenDocument = Token & Document

const tokenSchema = new SchemaClass(tokenDefinition)
const TokenModel = mongoose.model<TokenDocument>('Token', tokenSchema)

export {
  Token,
  TokenDocument,
  TokenModel,
}
