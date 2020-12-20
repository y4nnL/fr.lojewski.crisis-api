import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import { Document, Schema } from 'mongoose'
import { UserAction } from '@/types/user'

export interface User {
  actions: UserAction[]
  email: string
  isDisabled: boolean
  isValidated: boolean
  password: string
  canPerform(action: UserAction): Promise<boolean>
  matchPassword(password: string): Promise<boolean>
  toString(): string
}

export type UserDocument = User & Document

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

userSchema.methods.canPerform = async function (action: UserAction): Promise<boolean> {
  return this.actions.indexOf(action) >= 0
}

userSchema.methods.matchPassword = async function (password: string): Promise<boolean> {
  return bcrypt.compare(password, this.password)
}

userSchema.methods.toString = function (): string {
  return `[User ${ this.email }]`
}

export const UserModel = mongoose.model<UserDocument>('User', userSchema)
