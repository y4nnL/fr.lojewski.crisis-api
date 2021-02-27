import httpStatus from 'http-status'
import { APIError, BadRequestAPIError, ErrorId } from '@/types'
import { ErrorRequestHandler } from 'express'
import { ValidationError } from 'express-validation'

export const castError: ErrorRequestHandler = (error: any, request, response, next) => {
  if (error instanceof ValidationError) {
    const errorIds: ErrorId[] = []
    error.details.body?.forEach((body) => errorIds.push(ErrorId.narrow(body.message) ? body.message : '__unknown__'))
    error = new BadRequestAPIError(errorIds)
    error.stack = ''
  } else {
    if (!(error instanceof APIError)) {
      const stack = error ? error.stack || '' : ''
      const message = error ? error.message || error : ''
      error = new APIError(httpStatus.INTERNAL_SERVER_ERROR, message)
      error.stack = stack
    }
  }
  next(error)
}
