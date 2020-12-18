import createLogger from '@/utils/logger'
import env from '@/utils/env'
import mongoose from 'mongoose'

const dbLogger = createLogger('db')

export async function connectDB() {
  const db = env.dbUri.split('/').pop()
  try {
    await mongoose.connect(env.dbUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    dbLogger.info(`Connected to "${ db }"`)
    if (env.isDevelopment) {
      mongoose.set('debug', (collectionName: any, method: any, query: any) => {
        dbLogger.debug(`${ collectionName }.${ method }`)
        dbLogger.debug(query)
      })
    }
  } catch (e) {
    dbLogger.error(`Unable to connect to "${ db }"`)
  }
}
