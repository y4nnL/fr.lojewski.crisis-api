import createLogger from '@/utils/logger'
import { NextFunction, Request, RequestHandler, Response } from 'express'

export const queueLogger = createLogger('queue')

export class Queue {
  
  jobs: Parameters<RequestHandler>[] = []
  lock = false
  
  onResponseFinished: () => any
  requestHandlers: RequestHandler[]
  response: Response
  
  constructor(requestHandlers: RequestHandler[]) {
    this.onResponseFinished = () => {
      queueLogger.silly('response "finish" fired')
      this.dequeue()
    }
    this.requestHandlers = this.mapRequestHandlers(requestHandlers)
  }
  
  dequeue() {
    queueLogger.silly('entering dequeue (' + (this.jobs.length) + ') jobs in queue')
    queueLogger.silly('removing listener & unlocking')
    this.response.off('finish', this.onResponseFinished)
    this.lock = false
    const job = this.jobs.shift()
    if (job) {
      queueLogger.silly('dequeueing (1) of (' + (this.jobs.length + 1) + ')')
      this.requestHandlers[0](...job)
    } else {
      queueLogger.silly('no more queue')
    }
  }
  
  private mapRequestHandlers(requestHandlers: RequestHandler[]) {
    return requestHandlers.map((handler, index) => {
      return (request: Request, response: Response, originalNext: NextFunction) => {
        queueLogger.silly('entering handler (' + index + ')')
        const next = (error?: any) => {
          queueLogger.silly('entering next (' + index + ')')
          const isLast = typeof error !== 'undefined' || index === requestHandlers.length - 1
          if (isLast) {
            queueLogger.silly('last handler (' + index + ') next')
            this.dequeue()
          }
          error ? originalNext(error) : originalNext()
        }
        if (index === 0) {
          if (this.lock) {
            queueLogger.silly('locked, queueing in (' + (this.jobs.length + 1) + ')')
            this.jobs.push([ request, response, originalNext ])
          } else {
            queueLogger.silly('listening & locking & processing handler (' + index +')')
            response.on('finish', this.onResponseFinished)
            this.response = response
            this.lock = true
            handler(request, response, next)
          }
        } else {
          queueLogger.silly('processing handler (' + index + ')')
          handler(request, response, next)
        }
      }
    })
  }
  
}

function queue(requestHandler: RequestHandler): RequestHandler
function queue(...requestHandlers: RequestHandler[]): RequestHandler[]
function queue(...requestHandlers: RequestHandler[]): RequestHandler | RequestHandler[] {
  return requestHandlers.length === 1 ?
    new Queue(requestHandlers).requestHandlers[0] : new Queue(requestHandlers).requestHandlers
}

export { queue }
