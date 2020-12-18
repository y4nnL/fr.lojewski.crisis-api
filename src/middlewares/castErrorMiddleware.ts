import httpStatus from 'http-status'
import { APIError } from '@/types'
import { ErrorRequestHandler } from 'express'
import { ValidationError } from 'express-validation'

export const castError: ErrorRequestHandler = (error: any, request, response, next) => {
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
