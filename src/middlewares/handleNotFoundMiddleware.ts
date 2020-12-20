import { NotFoundAPIError } from '@/types'
import { RequestHandler } from 'express'

export const handleNotFound: RequestHandler = (request, response, next) => {
  next(new NotFoundAPIError())
}
