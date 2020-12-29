import { serverLogger } from '@/core/server' // import this first to avoid CD
import { log } from './logMiddleware'
import { sleep } from '~/helpers/utils'

describe('log middleware', () => {
  
  let onHandler: any
  
  const loggerInfoSpy = jest.spyOn(serverLogger, 'info')
  const next = jest.fn()
  const request: any = {
    method: 'GET',
    originalUrl: '/endpoint',
  }
  const response: any = {
    on: (event: any, handler: any) => onHandler = handler,
    statusCode: 200,
  }
  
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  it('should log server started & finished request events', async () => {
    log(request, response, next)
    expect(request.startTime).toBeInstanceOf(Date)
    expect(loggerInfoSpy).toHaveBeenCalledWith(`Started ${ request.method } ${ request.originalUrl }`)
    await sleep(Math.random())
    onHandler()
    expect(loggerInfoSpy).toHaveBeenCalledWith(expect.stringMatching(
      new RegExp(`^Finished ${ request.method } ${ request.originalUrl } ${ response.statusCode } in [0-9.]+?s$`)))
  })
  
  it('should log only server started request event', async () => {
    log(request, response, next)
    loggerInfoSpy.mockClear()
    await sleep(Math.random())
    response.isErrorHandled = true
    onHandler()
    expect(loggerInfoSpy).not.toHaveBeenCalled()
  })
  
})
