import { MongoMemoryServer } from 'mongodb-memory-server'

declare global {
  namespace NodeJS {
    interface Global {
      mongo: MongoMemoryServer
    }
  }
}
