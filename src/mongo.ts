import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import { Document, Schema } from 'mongoose'

import createLogger from './logger'
import env from './env'
import { Token, User } from './types'

const mongoLogger = createLogger('mongo')

export interface UserDocument extends Document {
  email: string
  isDisabled: boolean
  isValidated: boolean
  password: string
  canPerform(action: User.Action): Promise<boolean>
  matchPassword(password: string): Promise<boolean>
}

export const userSchema: Schema = new Schema({
  actions: {
    type: Schema.Types.Array,
  },
  email: {
    type: Schema.Types.String,
    required: true,
  },
  isDisabled: {
    type: Schema.Types.Boolean,
    default: true,
  },
  isValidated: {
    type: Schema.Types.Boolean,
    default: false,
  },
  password: {
    type: Schema.Types.String,
  },
})

userSchema.methods.canPerform = async function (action: User.Action): Promise<boolean> {
  return this.actions.indexOf(action) >= 0
}

userSchema.methods.matchPassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password)
}

export interface TokenDocument extends Document {
  token: string
  type: Token.Type
  userId: string
}

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

export const UserModel = mongoose.model<UserDocument>('User', userSchema)
export const TokenModel = mongoose.model<TokenDocument>('Token', tokenSchema)

export default async function connect() {
  const db = env.dbUri.split('/').pop()
  try {
    await mongoose.connect(env.dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    mongoLogger.info(`Connected to "${ db }"`)
    if (env.isDevelopment) {
      mongoose.set('debug', (collectionName: any, method: any, query: any) => {
        mongoLogger.debug(`${ collectionName }.${ method }`)
        mongoLogger.debug(query)
      })
    }
  } catch (e) {
    mongoLogger.error(`Unable to connect to "${ db }"`)
  }
}
