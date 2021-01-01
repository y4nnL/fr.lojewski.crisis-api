import createLogger from '@/utils/logger'
import { APIError } from '@/types'
import { NextFunction, Request, RequestHandler, Response } from 'express'

type RH = RequestHandler

export const anonymizeErrorLogger = createLogger('anonymizeError')

function anonymizeError(anonymousError: APIError, requestHandler: RH): RH
function anonymizeError(anonymousError: APIError, ...requestHandlers: RH[]): RH[]
function anonymizeError(anonymousError: APIError, ...requestHandlers: RH[]): RH | RH[] {
  const buildHandler = (handler: RH): RH =>
    (request: Request, response: Response, next: NextFunction) => {
      handler(request, response, (error?: any) => {
        if (error) {
          anonymizeErrorLogger.pass(`Replaced ${ error } with ${ anonymousError }`)
          next(anonymousError)
        } else {
          next()
        }
      })
    }
  
  return requestHandlers.length === 1 ?
    buildHandler(requestHandlers[0]) : requestHandlers.map<RH>(buildHandler)
}

export { anonymizeError }
