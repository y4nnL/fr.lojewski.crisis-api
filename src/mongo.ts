import mongoose, { Document, Schema } from 'mongoose'

import createLogger from './winston'
import env from './env'

const mongoLogger = createLogger('mongo')

export interface User extends Document {
  firstName: string
  lastName: string
}

const UserSchema: Schema = new Schema({
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
})

const UserModel = mongoose.model<User>('User', UserSchema)

export { UserModel }

export default async function () {
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
