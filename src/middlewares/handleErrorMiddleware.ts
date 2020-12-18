import { ErrorRequestHandler } from 'express'

import createLogger from '@/utils/logger'
import env from '@/utils/env'
import { APIError } from '@/types'

const handleErrorLogger = createLogger('handleError')

export const handleError: ErrorRequestHandler = (error: APIError, request, response, next) => {
  const json: any = { message: error.message }
  handleErrorLogger.error(`Finished ${ request.method } ${ request.url } ${ error.statusCode } ${ error.message }`)
  if (error.stack) {
    handleErrorLogger.error(error.stack)
    if (!env.isProduction) {
      json.stack = error.stack
    }
  }
  response.isErrorHandled = true
  response.status(error.statusCode)
  response.json(json)
}