import mongoose from 'mongoose'
import { Document, Schema } from 'mongoose'
import { TokenType } from '@/types'

export interface Token {
  token: string
  type: TokenType
  userId: string
}

export type TokenDocument = Token & Document

export const tokenSchema = new Schema({
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
})

export const TokenModel = mongoose.model<TokenDocument>('Token', tokenSchema)
