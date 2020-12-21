import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { MongoMemoryServer } from 'mongodb-memory-server';
import { v4 as uuidV4 } from 'uuid'

declare global {
  namespace NodeJS {
    interface Global {
      mongo: MongoMemoryServer
    }
  }
}

export default async () => {
  global.mongo = new MongoMemoryServer()
  const sshPath = path.resolve(path.join(__dirname, '__files__' + uuidV4()))
  fs.mkdirSync(sshPath)
  dotenv.config()
  process.env.NODE_ENV = 'test'
  process.env.DB_URI = await global.mongo.getUri();
  process.env.SSH_KEYS_PATH = sshPath
};
