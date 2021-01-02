import env from '@/utils/env'

describe('server core', () => {
  
  const pathCert = env.pathCert
  const pathCertCA = env.pathCertCA
  const pathCertKEY = env.pathCertKey
  
  beforeEach(() => {
    jest.resetModules()
    // @ts-ignore
    env['pathCert'] = pathCert
    // @ts-ignore
    env['pathCertCA'] = pathCertCA
    // @ts-ignore
    env['pathCertKEY'] = pathCertKEY
  })
  
  it('should not start without a certificate', () => {
    const localEnv = require('../utils/env').default
    // @ts-ignore
    localEnv['pathCert'] = 'unknown'
    expect(() => require('./server')).toThrow('Unable to locate certificate files')
  })
  
  it('should not start without a authority', () => {
    const localEnv = require('../utils/env').default
    // @ts-ignore
    localEnv['pathCertCA'] = 'unknown'
    expect(() => require('./server')).toThrow('Unable to locate certificate files')
  })
  
  it('should not start without a key', () => {
    const localEnv = require('../utils/env').default
    // @ts-ignore
    localEnv['pathCertKey'] = 'unknown'
    expect(() => require('./server')).toThrow('Unable to locate certificate files')
  })
  
  it('should start & stop', async () => {
    const server = require('./server')
    const loggerSpy = jest.spyOn(server.serverLogger, 'pass')
    expect(await server.start()).toStrictEqual(true)
    expect(loggerSpy).toHaveBeenCalledWith(`Started https://localhost:${ env.serverPort }/`)
    expect(await server.stop()).toStrictEqual(true)
    expect(loggerSpy).toHaveBeenCalledWith(`Stopped https://localhost:${ env.serverPort }/`)
  })
  
  it('should not start twice', async () => {
    const server = require('./server')
    await server.start()
    await expect(server.start()).rejects.toBeTruthy()
    await server.stop()
  })
  
  it('should not stop if not started', async () => {
    const server = require('./server')
    await expect(server.stop()).rejects.toBeTruthy()
  })
  
})
