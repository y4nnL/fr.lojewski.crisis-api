import * as error from '@/types/error'
import { handleNotFound } from './handleNotFoundMiddleware'
import { NextFunction, Request, Response } from 'express'

describe('handleNotFound middleware', () => {
  
  it('should next an NotFoundAPIError', () => {
    let next: NextFunction = <NextFunction>jest.fn()
    handleNotFound(<Request>{}, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(new error.NotFoundAPIError())
  })
  
})
