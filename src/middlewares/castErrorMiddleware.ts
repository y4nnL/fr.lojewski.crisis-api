import httpStatus from 'http-status'
import { APIError, BadRequestAPIError, ErrorId } from '@/types'
import { ErrorRequestHandler } from 'express'
import { ValidationError } from 'express-validation'

const ErrorIdValues = Object.values(ErrorId)

export const castError: ErrorRequestHandler = (error: any, request, response, next) => {
  if (error instanceof ValidationError) {
    const errorId: ErrorId[] = []
    error.details.body?.forEach((body) => errorId.push(
      ErrorIdValues.includes(<ErrorId>body.message) ? <ErrorId>body.message : ErrorId.__Unknown__))
    error = new BadRequestAPIError(errorId)
    error.stack = ''
  } else {
    if (!(error instanceof APIError)) {
      const stack = error?.stack
      error = new APIError(httpStatus.INTERNAL_SERVER_ERROR, error.message || error)
      error.stack = stack || ''
    }
  }
  next(error)
}
