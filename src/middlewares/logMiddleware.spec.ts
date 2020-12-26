import { serverLogger } from '@/core/server' // import this first to avoid CD
import { log } from './logMiddleware'

describe('log middleware', () => {
  
  let onHandler: any
  
  const loggerSPy = jest.spyOn(serverLogger, 'info')
  const next = jest.fn()
  const request: any = {
    method: 'GET',
    originalUrl: '/endpoint',
  }
  const response: any = {
    on: (event: any, handler: any) => onHandler = handler,
    statusCode: 200,
  }
  const sleep = async (time: number) => await new Promise((resolve) => setTimeout(resolve, time * 1000))
  
  it('should log server started & finished request events', async () => {
    log(request, response, next)
    expect(request.startTime).toBeInstanceOf(Date)
    expect(loggerSPy).toHaveBeenCalledWith(`Started ${ request.method } ${ request.originalUrl }`)
    await sleep(Math.random())
    onHandler()
    expect(loggerSPy).toHaveBeenCalledWith(expect.stringMatching(
      new RegExp(`^Finished ${ request.method } ${ request.originalUrl } ${ response.statusCode } in [0-9.]+?s$`)))
  })
  
  it('should log only server started request event', async () => {
    log(request, response, next)
    await sleep(Math.random())
    response.isErrorHandled = true
    jest.resetAllMocks()
    onHandler()
    expect(loggerSPy).not.toHaveBeenCalled()
  })
  
})
