import mongoose from 'mongoose'
import { Document, Schema } from 'mongoose'
import { SchemaClass, SchemaDefinition, TokenType, UserAction } from '@/types'
import { UserDocument, UserModel } from '@/models/User'

type Token = {
  token: string
  type: TokenType
  userId: string
}

type TokenMethods = {
  getUser(this: Token): Promise<UserDocument | null>
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

const tokenMethods: TokenMethods = {
  async getUser(): Promise<UserDocument | null> {
    return await UserModel.findById(this.userId).exec()
  }
}

type TokenDocument = Token & TokenMethods & Document

const tokenSchema = new SchemaClass(tokenDefinition, tokenMethods)
const TokenModel = mongoose.model<TokenDocument>('Token', tokenSchema)

export {
  Token,
  TokenDocument,
  TokenModel,
}
