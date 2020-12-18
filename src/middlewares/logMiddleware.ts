import { RequestHandler } from 'express'

import createLogger from '@/utils/logger'

const logLogger = createLogger('log')

export const log: RequestHandler = (request, response, next) => {
  request.startTime = new Date()
  logLogger.info(`Started ${ request.method } ${ request.originalUrl }`)
  response.on('finish', () => {
    if (!response.isErrorHandled) {
      const finishTimeMS = new Date(new Date().getTime() - request.startTime.getTime()).getMilliseconds() / 1000
      logLogger.info(`Finished ${ request.method } ${ request.originalUrl } ${ response.statusCode } in ${ finishTimeMS }s`)
    }
  })
  next()
}
