import assert from '@/utils/assert'
import createLogger from '@/utils/logger'
import env from '@/utils/env'
import mongoose from 'mongoose'

let dbName: string | undefined

export const dbLogger = createLogger('db')

if (env.isDevelopment) {
  mongoose.set('debug', (collectionName: any, method: any, query: any) => {
    dbLogger.debug(`${ collectionName }.${ method }`)
    dbLogger.debug(query)
  })
}

export async function connect(): Promise<boolean> {
  try {
    dbName = env.dbUri.split('/').pop()
    assert(dbName)
    dbName = dbName.replace(/\?$/, '')
    await mongoose.connect(env.dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    dbLogger.pass(`Connected to "${ dbName }"`)
    return true
  } catch (e) {
    dbLogger.error('Unable to connect to database')
    return false
  }
}

export async function disconnect() {
  await mongoose.disconnect()
  dbLogger.pass(`Disconnected from "${ dbName }"`)
}
