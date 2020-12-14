import express, { ErrorRequestHandler, NextFunction, RequestHandler } from 'express'
import { Request, Response } from 'express-serve-static-core'

import router from './router'
import createLogger from './logger'

declare global {
  namespace Express {
    interface Request {
      startTime?: Date
    }
    interface Response {
      isErrorHandled?: boolean
    }
  }
}

class APIError extends Error {
  
  message: string
  statusCode: number
  
  constructor(message: string, statusCode: number) {
    super();
    this.message = message
    this.statusCode = statusCode
  }
  
}

const app = express()
const httpLogger = createLogger('http')

const logMiddleware: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
  request.startTime = new Date()
  httpLogger.info(`Started ${ request.method } ${ request.url }`)
  response.on('finish', () => {
    if (!response.isErrorHandled) {
      const finishTimeMS = new Date(new Date().getTime() - request.startTime.getTime()).getUTCMilliseconds() / 1000
      httpLogger.info(`Finished ${ request.method } ${ request.url } ${ response.statusCode } ${ finishTimeMS }s`)
    }
  })
  next()
}

const notFoundHandler: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
  next(new APIError('API not found', 404))
}

const errorHandler: ErrorRequestHandler =
  (error: APIError, request: Request, response: Response, next: NextFunction) => {
  const json: any = { message: error.message }
  if ( process.env.NODE_ENV !== 'production') {
    json.stack = error.stack
  }
  httpLogger.error(`Finished ${ request.method } ${ request.url } ${ error.statusCode } ${ error.message }`)
  httpLogger.error(error.stack)
  response.isErrorHandled = true
  response.status(error.statusCode)
  response.json(json)
};

app.use(logMiddleware);
app.use('/api', router);
app.use(notFoundHandler)
app.use(errorHandler)

export default app
