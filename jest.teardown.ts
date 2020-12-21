import rimraf from 'rimraf'
import { MongoMemoryServer } from 'mongodb-memory-server'

// TODO <low> find another place for this
declare global {
  namespace NodeJS {
    interface Global {
      mongo: MongoMemoryServer
    }
  }
}

export default async () => {
  await global.mongo.stop()
  if (process.env.SSH_KEYS_PATH) {
    rimraf.sync(process.env.SSH_KEYS_PATH)
  }
}
