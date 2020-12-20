import { handleNotFound } from './handleNotFoundMiddleware'
import { NextFunction, Request, Response } from 'express'
import { NotFoundAPIError } from '@/types'

describe('handleNotFound middleware', () => {
  
  it('should next an NotFoundAPIError', () => {
    let next: NextFunction = <NextFunction>jest.fn()
    handleNotFound(<Request>{}, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(new NotFoundAPIError())
  })
  
})
