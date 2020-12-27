import dotenv from 'dotenv'
import fs from 'fs'
import path from 'path'
import { v4 as uuidV4 } from 'uuid'

export default async () => {
  const sshPath = path.resolve(path.join(__dirname, '__files__' + uuidV4()))
  fs.mkdirSync(sshPath)
  dotenv.config()
  process.env.NODE_ENV = 'test'
  process.env.SSH_KEYS_PATH = sshPath
};
