import bcrypt from 'bcrypt'
import mongoose from 'mongoose'
import { Document, Schema } from 'mongoose'
import { SchemaDefinition, SchemaClass, UserAction } from '@/types'

type User = {
  actions?: UserAction[]
  email: string
  isDisabled?: boolean
  isValidated?: boolean
  password?: string
}

type UserMethods = {
  canPerform(this: User, action: UserAction): boolean
  matchPassword(this: User, password: string): Promise<boolean>
  toString(this: User,): string
}

type UserDocument = User & UserMethods & Document

const userDefinition: SchemaDefinition<User> = {
  actions: Schema.Types.Array,
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
  password: Schema.Types.String,
}

const userMethods: UserMethods = {
  canPerform(action: UserAction): boolean {
    return this.actions.indexOf(action) >= 0
  },
  async matchPassword(password: string): Promise<boolean> {
    return await bcrypt.compare(password, this.password)
  },
  toString(): string {
    return `[User ${ this.email }]`
  },
}

const userSchema = new SchemaClass(userDefinition, userMethods)
const UserModel = mongoose.model<UserDocument>('User', userSchema)

export {
  User,
  UserDocument,
  UserModel,
}
