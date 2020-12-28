import mongoose from 'mongoose'

// Set dev mode before importing env
process.env.NODE_ENV = 'development'
// Spy mongoose set function before importing db
const mongooseSetSpy = jest.spyOn(mongoose, 'set')

import env from '@/utils/env'
import { connect, dbLogger, disconnect } from '@/core/db'
import { MongoMemoryServer } from 'mongodb-memory-server'
import { UserModel } from '@/models'

describe('db core', () => {
  
  const loggerDebugSpy = jest.spyOn(dbLogger, 'debug')
  const loggerErrorSpy = jest.spyOn(dbLogger, 'error')
  const loggerPassSpy = jest.spyOn(dbLogger, 'pass')
  
  beforeEach(() => {
    loggerDebugSpy.mockClear()
    loggerErrorSpy.mockClear()
    loggerPassSpy.mockClear()
  })
  
  it('should not connect', async () => {
    // @ts-ignore
    env['dbUri'] = 'unknown'
    expect(await connect()).toStrictEqual(false)
    expect(loggerErrorSpy).toHaveBeenCalledWith('Unable to connect to database')
  })
  
  it('should connect & disconnect', async () => {
    const dbName = 'database'
    const mongo = new MongoMemoryServer({ instance: { dbName } })
    // @ts-ignore
    env['dbUri'] = await mongo.getUri()
    expect(await connect()).toStrictEqual(true)
    expect(loggerPassSpy).toHaveBeenCalledWith(`Connected to "${ dbName }"`)
    await disconnect()
    await mongo.stop()
  })
  
  it('should set the mongoose debug flag in dev mode', async () => {
    const mongo = new MongoMemoryServer()
    // @ts-ignore
    env['dbUri'] = await mongo.getUri()
    await connect()
    expect(mongooseSetSpy.mock.calls[0][0]).toStrictEqual('debug')
    await UserModel.create({ email: 'test' })
    expect(loggerDebugSpy.mock.calls).toEqual([
      [ 'users.insertOne' ],
      [ expect.objectContaining({ email: 'test' }) ],
    ])
    await disconnect()
    await mongo.stop()
  })
  
  it('should not set the mongoose debug flag in prod mode', async () => {
    jest.resetModules()
  
    const localMongoose = require('mongoose')
    const localMongo = new (require('mongodb-memory-server').MongoMemoryServer)()
    // Set env variables before importing db
    process.env.NODE_ENV = 'production'
    process.env.DB_URI = await localMongo.getUri()
    // Spy mongoose set function before importing db
    const localMongooseSetSpy = jest.spyOn(localMongoose, 'set')
    const localDb = require('@/core/db')
    const LocalUserModel = require('@/models/User').UserModel
    const localLoggerDebugSpy = jest.spyOn(localDb.dbLogger, 'debug')
    
    await localDb.connect()
    expect(localMongooseSetSpy).not.toHaveBeenCalled()
    await LocalUserModel.create({ email: 'test' })
    expect(localLoggerDebugSpy).not.toHaveBeenCalled()
    await localDb.disconnect()
    await localMongo.stop()
  })
  
})
