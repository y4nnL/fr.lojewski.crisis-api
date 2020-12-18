import mongoose from 'mongoose'
import { Document, Schema } from 'mongoose'
import { Token } from '@/types'

export interface Token extends Document {
  token: string
  type: Token.Type
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
