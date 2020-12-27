import env from '@/utils/env'

describe('server', () => {
  
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
  
  it('should start & stop', (done) => {
    const server = require('./server')
    const loggerSpy = jest.spyOn(server.serverLogger, 'info')
    server.start(() => {
      expect(loggerSpy).toHaveBeenCalledWith(`Started on https://localhost:${ env.serverPort }/`)
      server.stop(() => {
        expect(loggerSpy).toHaveBeenCalledWith(`Stopped on https://localhost:${ env.serverPort }/`)
        done()
      })
    })
  })
  
})
