import rimraf from 'rimraf'
import { MongoMemoryServer } from 'mongodb-memory-server'

declare global {
  namespace NodeJS {
    interface Global {
      mongo: MongoMemoryServer
    }
  }
}

export default async () => {
  await global.mongo.stop()
  rimraf.sync(process.env.SSH_KEYS_PATH)
}
