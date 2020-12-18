import { RequestHandler } from 'express'

import { NotFoundAPIError } from '@/types'

export const handleNotFound: RequestHandler = (request, response, next) => {
  next(new NotFoundAPIError())
}
