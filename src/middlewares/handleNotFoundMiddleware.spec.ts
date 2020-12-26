import { handleNotFound } from './handleNotFoundMiddleware'
import { NotFoundAPIError } from '@/types'

describe('handleNotFound middleware', () => {
  
  it('should next an NotFoundAPIError', () => {
    let next: any = jest.fn()
    handleNotFound(<any>{}, <any>{}, next)
    expect(next).toHaveBeenCalledWith(new NotFoundAPIError())
  })
  
})
