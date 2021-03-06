import assert from '@/utils/assert'
import createLogger from '@/utils/logger'
import env from '@/utils/env'
import fs from 'fs'
import mongoose from 'mongoose'
import path from 'path'
import { sleep } from '~/helpers/utils'
import { APIError } from '@/types'

describe('logger util', () => {
  
  class MyClass {
    property = 'value'
  }
  
  const serviceName = 'logger'
  const dateRegExp = /^\d{4}-[01]\d-[0-3]\dT[0-2]\d:[0-5]\d:[0-5]\d\.\d+([+-][0-2]\d:[0-5]\d|Z)/
  const logger = createLogger(serviceName)
  const sillySpy = jest.spyOn(logger, 'silly')
  const debugSpy = jest.spyOn(logger, 'debug')
  const infoSpy = jest.spyOn(logger, 'info')
  const passSpy = jest.spyOn(logger, 'pass')
  const warnSpy = jest.spyOn(logger, 'warn')
  const errorSpy = jest.spyOn(logger, 'error')
  // @ts-ignore
  const consoleSpy = jest.spyOn(console._stdout, 'write')
  
  beforeEach(() => {
    // @ts-ignore
    env['isTest'] = true
    // @ts-ignore
    env['isDevelopment'] = false
    // @ts-ignore
    env['isProduction'] = false
  })
  
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  it('should log to console in dev mode', () => {
    // @ts-ignore
    env['isProduction'] = false
    // @ts-ignore
    env['isTest'] = false
    // @ts-ignore
    env['isDevelopment'] = true
    const localLogger = createLogger(serviceName)
    const level = 'debug'
    const message = 'ok'
    const localSpy = jest.spyOn(localLogger, level)
    localLogger[level](message)
    expect(localSpy).toHaveBeenCalledWith(message)
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(dateRegExp))
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(
      `[${ serviceName }] \u001b[36m${ level }\u001b[39m: \u001b[38;2;106;135;89m${ message }\u001b[39m`))
  })
  
  it('should log to console in test mode', () => {
    const localLogger = createLogger(serviceName)
    const level = 'silly'
    const message = 'ok'
    const localSpy = jest.spyOn(localLogger, level)
    localLogger[level](message)
    expect(localSpy).toHaveBeenCalledWith(message)
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(dateRegExp))
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(
      `[${ serviceName }] \u001b[37m${ level }\u001b[39m: \u001b[38;2;106;135;89m${ message }\u001b[39m`))
  })
  
  it('should log to files in prod mode', async () => {
    // @ts-ignore
    env['isProduction'] = true
    const localLogger = createLogger(serviceName)
    const level = 'info'
    const message = 'loggerUnitTest.' + new Date().toISOString()
    const localSpy = jest.spyOn(localLogger, level)
    const combinedPath = path.resolve(__dirname, '../../logs/combined.log')
    const errorPath = path.resolve(__dirname, '../../logs/error.log')
    localLogger[level](message)
    expect(localSpy).toHaveBeenCalledWith(message)
    // Wait for the files to be created or updated
    await sleep(1)
    expect(fs.existsSync(combinedPath)).toStrictEqual(true)
    expect(fs.existsSync(errorPath)).toStrictEqual(true)
    const combined = fs.readFileSync(combinedPath, 'utf8')
    const jsonMatch = combined.match(/^{(.*)?}$/gm)
    expect(jsonMatch).toBeTruthy()
    assert(jsonMatch) // compiler hint
    const log: any = jsonMatch.map((json) => JSON.parse(json)).find((json: any) => json.message === message)
    expect(log).toBeTruthy()
    assert(log) // compiler hint
    expect(log.message).toStrictEqual(message)
    expect(log.level).toStrictEqual(level)
    expect(log.service).toStrictEqual(serviceName)
    expect(log.timestamp).toMatch(dateRegExp)
  })
  
  it('should have different level colors', () => {
    const message = 'ok'
    logger.silly(message)
    logger.debug(message)
    logger.info(message)
    logger.pass(message)
    logger.warn(message)
    logger.error(message)
    expect(sillySpy).toHaveBeenCalledWith(message)
    expect(debugSpy).toHaveBeenCalledWith(message)
    expect(infoSpy).toHaveBeenCalledWith(message)
    expect(passSpy).toHaveBeenCalledWith(message)
    expect(warnSpy).toHaveBeenCalledWith(message)
    expect(errorSpy).toHaveBeenCalledWith(message)
    expect(consoleSpy.mock.calls[0][0]).toMatch(dateRegExp)
    expect(consoleSpy.mock.calls[0][0]).toContain(
      `[${ serviceName }] \u001b[37msilly\u001b[39m: \u001b[38;2;106;135;89m${ message }\u001b[39m`)
    expect(consoleSpy.mock.calls[1][0]).toMatch(dateRegExp)
    expect(consoleSpy.mock.calls[1][0]).toContain(
      `[${ serviceName }] \u001b[36mdebug\u001b[39m: \u001b[38;2;106;135;89m${ message }\u001b[39m`)
    expect(consoleSpy.mock.calls[2][0]).toMatch(dateRegExp)
    expect(consoleSpy.mock.calls[2][0]).toContain(
      `[${ serviceName }] \u001b[33minfo\u001b[39m: \u001b[38;2;106;135;89m${ message }\u001b[39m`)
    expect(consoleSpy.mock.calls[3][0]).toMatch(dateRegExp)
    expect(consoleSpy.mock.calls[3][0]).toContain(
      `[${ serviceName }] \u001b[32mpass\u001b[39m: \u001b[38;2;106;135;89m${ message }\u001b[39m`)
    expect(consoleSpy.mock.calls[4][0]).toMatch(dateRegExp)
    expect(consoleSpy.mock.calls[4][0]).toContain(
      `[${ serviceName }] \u001b[38;2;255;165;0mwarn\u001b[39m: \u001b[38;2;106;135;89m${ message }\u001b[39m`)
    expect(consoleSpy.mock.calls[5][0]).toMatch(dateRegExp)
    expect(consoleSpy.mock.calls[5][0]).toContain(
      `[${ serviceName }] \u001b[31merror\u001b[39m: \u001b[38;2;106;135;89m${ message }\u001b[39m`)
  })
  
  describe('log', () => {
    
    it('array', () => {
      logger.info([ 'item' ])
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(dateRegExp))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(
        `[${ serviceName }] \u001b[33minfo\u001b[39m: \n[\n  [0] \u001b[38;2;106;135;89mitem\u001b[39m,\n]\r\n`))
      // Nested
      logger.info([ [ 'item1', 'item2' ] ])
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(dateRegExp))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining([
        `[${ serviceName }] \u001b[33minfo\u001b[39m: \n[\n  [0] [\n`,
        `    [0] \u001b[38;2;106;135;89mitem1\u001b[39m,\n`,
        `    [1] \u001b[38;2;106;135;89mitem2\u001b[39m,\n  ],\n]\r\n`,
      ].join('')))
    })
    
    it('boolean', () => {
      logger.info(true)
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(dateRegExp))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(
        `[${ serviceName }] \u001b[33minfo\u001b[39m: \u001b[38;2;204;120;50mtrue\u001b[39m\r\n`))
    })
    
    it('class', () => {
      logger.info(new MyClass())
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(dateRegExp))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining([
        `[${ serviceName }] \u001b[33minfo\u001b[39m: \nMyClass {\n`,
        `  \u001b[38;2;152;118;170mproperty\u001b[39m: \u001b[38;2;106;135;89mvalue\u001b[39m,\n}\r\n`
      ].join('')))
      // Mongoose ObjectId special case
      const id = new mongoose.Types.ObjectId()
      logger.info(id)
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(dateRegExp))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(
        `[${ serviceName }] \u001b[33minfo\u001b[39m: ObjectId { ${ id._id } }\r\n`))
    })
    
    it('date', () => {
      const date = new Date()
      logger.info(date)
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(dateRegExp))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(
        `[${ serviceName }] \u001b[33minfo\u001b[39m: \u001b[38;2;152;118;170m${ date }\u001b[39m\r\n`))
    })
    
    it('null', () => {
      logger.info(null)
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(dateRegExp))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(
        `[${ serviceName }] \u001b[33minfo\u001b[39m: \u001b[38;2;204;120;50mnull\u001b[39m\r\n`))
    })
    
    it('number', () => {
      logger.info(42)
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(dateRegExp))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(
        `[${ serviceName }] \u001b[33minfo\u001b[39m: \u001b[38;2;104;151;187m42\u001b[39m\r\n`))
    })
    
    it('object', () => {
      logger.info({ property: 'value' })
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(dateRegExp))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining([
        `[${ serviceName }] \u001b[33minfo\u001b[39m: \n{\n`,
        `  \u001b[38;2;152;118;170mproperty\u001b[39m: \u001b[38;2;106;135;89mvalue\u001b[39m,\n}\r\n`
      ].join('')))
      // Nested
      logger.info({ object: { propertyA: 'valueA', propertyB: 'valueB' } })
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(dateRegExp))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining([
        `[${ serviceName }] \u001b[33minfo\u001b[39m: \n{\n`,
        `  \u001b[38;2;152;118;170mobject\u001b[39m: {\n`,
        `    \u001b[38;2;152;118;170mpropertyA\u001b[39m: \u001b[38;2;106;135;89mvalueA\u001b[39m,\n`,
        `    \u001b[38;2;152;118;170mpropertyB\u001b[39m: \u001b[38;2;106;135;89mvalueB\u001b[39m,\n  },\n}\r\n`,
      ].join('')))
    })
    
    it('regexp', () => {
      logger.info(/42/)
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(dateRegExp))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(
        `[${ serviceName }] \u001b[33minfo\u001b[39m: \u001b[38;2;104;151;187m/42/\u001b[39m\r\n`))
    })
    
    it('string', () => {
      logger.info('string')
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(dateRegExp))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(
        `[${ serviceName }] \u001b[33minfo\u001b[39m: \u001b[38;2;106;135;89mstring\u001b[39m\r\n`))
    })
    
    it('symbol', () => {
      logger.info(Symbol(42))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(dateRegExp))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(
        `[${ serviceName }] \u001b[33minfo\u001b[39m: \u001b[38;2;152;118;170mSymbol(42)\u001b[39m\r\n`))
    })
    
    it('undefined', () => {
      logger.info(undefined)
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(dateRegExp))
      expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining(
        `[${ serviceName }] \u001b[33minfo\u001b[39m: \u001b[38;2;204;120;50mundefined\u001b[39m\r\n`))
    })
    
  })
  
  it('should handle APIError correctly', () => {
    logger.error(new APIError(500, 'error'))
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(dateRegExp))
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining([
      `[${ serviceName }] \u001b[31merror\u001b[39m: \n{\n`,
      `  \u001b[38;2;152;118;170mmessage\u001b[39m: \u001b[38;2;106;135;89merror\u001b[39m,\n`,
      `  \u001b[38;2;152;118;170mname\u001b[39m: \u001b[38;2;106;135;89mAPIError\u001b[39m,\n`,
      `  \u001b[38;2;152;118;170mstatusCode\u001b[39m: \u001b[38;2;104;151;187m500\u001b[39m,\n}\r\n`,
    ].join('')))
    logger.error({ message: new APIError(500, 'error') })
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringMatching(dateRegExp))
    expect(consoleSpy).toHaveBeenCalledWith(expect.stringContaining([
      `[${ serviceName }] \u001b[31merror\u001b[39m: \n{\n`,
      `  \u001b[38;2;152;118;170mmessage\u001b[39m: \u001b[38;2;106;135;89merror\u001b[39m,\n`,
      `  \u001b[38;2;152;118;170mname\u001b[39m: \u001b[38;2;106;135;89mAPIError\u001b[39m,\n`,
      `  \u001b[38;2;152;118;170mstatusCode\u001b[39m: \u001b[38;2;104;151;187m500\u001b[39m,\n}\r\n`,
    ].join('')))
  })
  
})
