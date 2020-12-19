import { NotFoundAPIError } from '@/types/error'
import { RequestHandler } from 'express'

export const handleNotFound: RequestHandler = (request, response, next) => {
  next(new NotFoundAPIError())
}
