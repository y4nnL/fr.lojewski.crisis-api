import bodyParser from 'body-parser'
import express from 'express'
import httpStatus from 'http-status'
import { ErrorRequestHandler, NextFunction, RequestHandler } from 'express'
import { Request, Response } from 'express-serve-static-core'
import { ValidationError } from 'express-validation'

import createLogger from './winston'
import env from './env'
import router from './router'

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

export class APIError extends Error {
  
  message: string
  statusCode: number
  
  constructor(message: string, statusCode: number) {
    super()
    this.message = message
    this.statusCode = statusCode
  }
  
}

export class NotFoundAPIError extends APIError {
  
  constructor(contextMessage?: string) {
    contextMessage ?
      super(`${ httpStatus[404] } (${ contextMessage })`, 404) :
      super(httpStatus[404], 404)
  }
  
}

export class UnauthorizedAPIError extends APIError {
  
  constructor(contextMessage?: string) {
    contextMessage ?
      super(`${ httpStatus[401] } (${ contextMessage })`, 401) :
      super(httpStatus[401], 401)
  }
  
}

const app = express()
const httpLogger = createLogger('http')

const logMiddleware: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
  request.startTime = new Date()
  httpLogger.info(`Started ${ request.method } ${ request.url }`)
  response.on('finish', () => {
    if (!response.isErrorHandled) {
      const finishTimeMS = new Date(new Date().getTime() - request.startTime.getTime()).getMilliseconds() / 1000
      httpLogger.info(`Finished ${ request.method } ${ request.url } ${ response.statusCode } in ${ finishTimeMS }s`)
    }
  })
  next()
}

const notFoundHandler: RequestHandler = (request: Request, response: Response, next: NextFunction) => {
  next(new NotFoundAPIError())
}

const errorCaster: ErrorRequestHandler = (error: any, request: Request, response: Response, next: NextFunction) => {
  if (error instanceof ValidationError) {
    const message = error.details.body.map((detail) => detail.message).join(', ')
    error = new APIError(`${ error.error } (${ message })`, error.statusCode)
    error.stack = ''
  } else {
    if (!(error instanceof APIError)) {
      const stack = error?.stack
      error = new APIError(error.message || error, httpStatus.INTERNAL_SERVER_ERROR)
      error.stack = stack || ''
    }
  }
  next(error)
}

const errorHandler: ErrorRequestHandler =
  (error: APIError, request: Request, response: Response, next: NextFunction) => {
    const json: any = { message: error.message }
    httpLogger.error(`Finished ${ request.method } ${ request.url } ${ error.statusCode } ${ error.message }`)
    if (error.stack) {
      httpLogger.error(error.stack)
      if (!env.isProduction) {
        json.stack = error.stack
      }
    }
    response.isErrorHandled = true
    response.status(error.statusCode)
    response.json(json)
  }

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(logMiddleware)
app.use('/api', router)
app.use(notFoundHandler)
app.use(errorCaster)
app.use(errorHandler)

export default app
