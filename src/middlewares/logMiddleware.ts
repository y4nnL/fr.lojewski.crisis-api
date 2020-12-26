import { RequestHandler } from 'express'
import { serverLogger } from '@/core/server'

export const log: RequestHandler = (request, response, next) => {
  request.startTime = new Date()
  serverLogger.info(`Started ${ request.method } ${ request.originalUrl }`)
  response.on('finish', () => {
    if (request.startTime && !response.isErrorHandled) {
      const finishTimeMS = new Date(new Date().getTime() - request.startTime.getTime()).getMilliseconds() / 1000
      serverLogger.info(
        `Finished ${ request.method } ${ request.originalUrl } ${ response.statusCode } in ${ finishTimeMS }s`)
    }
  })
  next()
}
