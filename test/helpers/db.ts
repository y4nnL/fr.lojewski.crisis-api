import env from '@/utils/env'
import { connect as dbConnect, disconnect as dbDisconnect } from '@/core/db'
import { MongoMemoryServer } from 'mongodb-memory-server'

let mongo: MongoMemoryServer

export async function connect() {
  mongo = new MongoMemoryServer()
  // @ts-ignore
  env['dbUri'] = await mongo.getUri();
  await dbConnect()
}

export async function disconnect() {
  await dbDisconnect()
  await mongo.stop()
}
