import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import { Document, Schema } from 'mongoose'

import createLogger from './winston'
import env from './env'

const mongoLogger = createLogger('mongo')

export interface User extends Document {
  email: string
  isDisabled: boolean
  isValidated: boolean
  password: string
  checkPassword(password: string): Promise<boolean>
}

export const userSchema: Schema = new Schema({
  isDisabled: {
    type: Schema.Types.Boolean,
    default: false,
  },
  isValidated: {
    type: Schema.Types.Boolean,
    default: false,
  },
  email: {
    type: Schema.Types.String,
    required: true,
  },
  password: {
    type: Schema.Types.String,
  },
})

userSchema.methods.checkPassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password)
}

export type TokenType = 'auth'

export interface Token extends Document {
  token: string
  type: TokenType
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

export const UserModel = mongoose.model<User>('User', userSchema)
export const TokenModel = mongoose.model<Token>('Token', tokenSchema)

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
