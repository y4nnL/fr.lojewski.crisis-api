import assert from 'assert'
import bodyParser from 'body-parser'
import express from 'express'
import fs from 'fs'
import https from 'https'
import httpStatus from 'http-status'
import path from 'path'
import { ErrorRequestHandler, NextFunction, RequestHandler } from 'express'
import { Request, Response } from 'express-serve-static-core'
import { ValidationError } from 'express-validation'

import createLogger from './winston'
import env from './env'
import router from './router'

// No types
const httpSignature = require('http-signature')

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

const log: RequestHandler = (request, response, next) => {
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

const verifySignature: RequestHandler = (request, response, next) => {
  try {
    const parsed = httpSignature.parse(request)
    assert.strictEqual(env.sshKeys.indexOf(parsed.keyId) >= 0, true)
    const pub = fs.readFileSync(path.join(env.sshKeysPath, `${ parsed.keyId }.pub`), 'ascii')
    const isVerified = httpSignature.verify(parsed, pub)
    assert.strictEqual(isVerified, true)
    httpLogger.info(`Request signature is verified (keyId:${ parsed.keyId })`)
    next()
  } catch (e) {
    httpLogger.error(e)
    next(new UnauthorizedAPIError())
  }
}

const handleNotFound: RequestHandler = (request, response, next) => {
  next(new NotFoundAPIError())
}

const castError: ErrorRequestHandler = (error: any, request, response, next) => {
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

const handleError: ErrorRequestHandler = (error: APIError, request, response, next) => {
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

if (!fs.existsSync(env.pathCert) || !fs.existsSync(env.pathCertCA) || !fs.existsSync(env.pathCertKey)) {
  throw new Error('Unable to locate certificate files')
}

const app = express()
const httpLogger = createLogger('http')
const cert = fs.readFileSync(env.pathCert, 'ascii')
const ca = fs.readFileSync(env.pathCertCA, 'ascii')
const key = fs.readFileSync(env.pathCertKey, 'ascii')
const server = https.createServer({ cert, ca, key }, app)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(log)
app.use(verifySignature)
app.use('/api', router)
app.use(handleNotFound)
app.use(castError)
app.use(handleError)

export default server
