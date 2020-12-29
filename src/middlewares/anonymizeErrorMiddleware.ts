import createLogger from '@/utils/logger'
import { APIError } from '@/types'
import { NextFunction, Request, RequestHandler, Response } from 'express'

type RH = RequestHandler

export const anonymizeErrorLogger = createLogger('anonymizeError')

function anonymizeError(requestHandler: RH, anonymousError: APIError): RH
function anonymizeError(requestHandler: RH[], anonymousError: APIError): RH[]
function anonymizeError(requestHandler: RH | RH[], anonymousError: APIError): RH | RH[] {
  const buildHandler = (handler: RH): RH =>
    (request: Request, response: Response, next: NextFunction) => {
      handler(request, response, (error?: any) => {
        if (error) {
          anonymizeErrorLogger.error(error)
          next(anonymousError)
        } else {
          next()
        }
      })
    }
  
  return typeof requestHandler === 'function' ?
    buildHandler(requestHandler) :
    requestHandler.map<RH>(buildHandler)
}

export { anonymizeError }
