import express from 'express'
import supertest from 'supertest'
import { Application, RequestHandler } from 'express'
import { queue, queueLogger } from '@/middlewares/queueMiddleware'
import { sleep } from '~/helpers/utils'

describe('queue middleware', () => {
  
  const singleCall = async (app: Application, url: URL) => await supertest(app).get(url + '/')
  const multipleCall = async (app: Application, url: URL) => await Promise.all([
    supertest(app).get(url + '/'),
    supertest(app).get(url + '/'),
    supertest(app).get(url + '/'),
  ])
  
  const app = express()
  const loggerSillySpy = jest.spyOn(queueLogger, 'silly')
  const middleware: Record<any, RequestHandler> = {
    firstHandler: (request, response, next) => next(),
    queuedHandler1: async (request, response, next) => await sleep(.1, next),
    queuedHandler2: async (request, response, next) => await sleep(.1, next),
    queuedHandler2End: async (request, response) => await sleep(.1, () => response.end()),
    queuedHandler2Error: async (request, response, next) => await sleep(.1, () => next('error')),
    queuedHandler3: async (request, response, next) => await sleep(.1, next),
    lastHandler: (request, response) => response.end(),
  }
  
  const firstHandlerSpy = jest.spyOn(middleware, 'firstHandler')
  const lastHandlerSpy = jest.spyOn(middleware, 'lastHandler')
  const queuedHandler1Spy = jest.spyOn(middleware, 'queuedHandler1')
  const queuedHandler2Spy = jest.spyOn(middleware, 'queuedHandler2')
  const queuedHandler2EndSpy = jest.spyOn(middleware, 'queuedHandler2End')
  const queuedHandler2ErrorSpy = jest.spyOn(middleware, 'queuedHandler2Error')
  const queuedHandler3Spy = jest.spyOn(middleware, 'queuedHandler3')
  
  type URL =
      '/single'
    | '/multipleNext'
    | '/multipleEnd'
    | '/multipleError'
  
  const routes: Record<any, { url: URL, queue: string[] }> = {
    single: { url: '/single', queue: [ '1' ] },
    multipleNext: { url: '/multipleNext', queue: [ '1', '2', '3' ] },
    multipleEnd: { url: '/multipleEnd', queue: [ '1', '2End', '3' ] },
    multipleError: { url: '/multipleError', queue: [ '1', '2Error', '3' ] },
  }
  
  Object.entries(routes)
    .forEach(([ key, route ]) => {
      const router = express.Router()
      router.route('/').get(
        middleware.firstHandler,
        queue(...route.queue.map((suffix) => middleware['queuedHandler' + suffix])),
        middleware.lastHandler,
      )
      app.use(route.url, router)
    })
  
  afterEach(() => {
    jest.clearAllMocks()
  })
  
  describe('as a single middleware', () => {
    
    it('should behave as normal with one call', async () => {
      await singleCall(app, '/single')
      expect(firstHandlerSpy).toHaveBeenCalledTimes(1)
      expect(queuedHandler1Spy).toHaveBeenCalledTimes(1)
      expect(lastHandlerSpy).toHaveBeenCalledTimes(1)
      expect(loggerSillySpy.mock.calls).toEqual([
        [ 'entering handler #0' ],
        [ 'listening & locking & processing handler #0' ],
        [ 'entering next #0' ],
        [ 'last handler #0 next' ],
        [ 'entering dequeue #0 jobs in queue' ],
        [ 'removing listener & unlocking' ],
        [ 'no more queue' ],
      ])
    })
    
    it('should queue multiple calls', async () => {
      await multipleCall(app, '/single')
      expect(firstHandlerSpy).toHaveBeenCalledTimes(3)
      expect(queuedHandler1Spy).toHaveBeenCalledTimes(3)
      expect(lastHandlerSpy).toHaveBeenCalledTimes(3)
      expect(loggerSillySpy.mock.calls).toEqual([
        [ 'entering handler #0' ],
        [ 'listening & locking & processing handler #0' ],
        [ 'entering handler #0' ],
        [ 'locked, queueing in #1' ],
        [ 'entering handler #0' ],
        [ 'locked, queueing in #2' ],
        [ 'entering next #0' ],
        [ 'last handler #0 next' ],
        [ 'entering dequeue #2 jobs in queue' ],
        [ 'removing listener & unlocking' ],
        [ 'dequeueing #1 of #2' ],
        [ 'entering handler #0' ],
        [ 'listening & locking & processing handler #0' ],
        [ 'entering next #0' ],
        [ 'last handler #0 next' ],
        [ 'entering dequeue #1 jobs in queue' ],
        [ 'removing listener & unlocking' ],
        [ 'dequeueing #1 of #1' ],
        [ 'entering handler #0' ],
        [ 'listening & locking & processing handler #0' ],
        [ 'entering next #0' ],
        [ 'last handler #0 next' ],
        [ 'entering dequeue #0 jobs in queue' ],
        [ 'removing listener & unlocking' ],
        [ 'no more queue' ],
      ])
    })
    
  })
  
  describe('as multiple middleware', () => {

    describe('when all the middleware next', () => {

      it('should behave as normal with one call', async () => {
        await singleCall(app, '/multipleNext')
        expect(firstHandlerSpy).toHaveBeenCalledTimes(1)
        expect(queuedHandler1Spy).toHaveBeenCalledTimes(1)
        expect(queuedHandler2Spy).toHaveBeenCalledTimes(1)
        expect(queuedHandler3Spy).toHaveBeenCalledTimes(1)
        expect(lastHandlerSpy).toHaveBeenCalledTimes(1)
        expect(loggerSillySpy.mock.calls).toEqual([
          [ 'entering handler #0' ],
          [ 'listening & locking & processing handler #0' ],
          [ 'entering next #0' ],
          [ 'entering handler #1' ],
          [ 'processing handler #1' ],
          [ 'entering next #1' ],
          [ 'entering handler #2' ],
          [ 'processing handler #2' ],
          [ 'entering next #2' ],
          [ 'last handler #2 next' ],
          [ 'entering dequeue #0 jobs in queue' ],
          [ 'removing listener & unlocking' ],
          [ 'no more queue' ],
        ])
      })

      it('should queue multiple calls', async () => {
        await multipleCall(app, '/multipleNext')
        expect(firstHandlerSpy).toHaveBeenCalledTimes(3)
        expect(queuedHandler1Spy).toHaveBeenCalledTimes(3)
        expect(queuedHandler2Spy).toHaveBeenCalledTimes(3)
        expect(queuedHandler3Spy).toHaveBeenCalledTimes(3)
        expect(lastHandlerSpy).toHaveBeenCalledTimes(3)
        expect(loggerSillySpy.mock.calls).toEqual([
          [ 'entering handler #0' ],
          [ 'listening & locking & processing handler #0' ],
          [ 'entering handler #0' ],
          [ 'locked, queueing in #1' ],
          [ 'entering handler #0' ],
          [ 'locked, queueing in #2' ],
          [ 'entering next #0' ],
          [ 'entering handler #1' ],
          [ 'processing handler #1' ],
          [ 'entering next #1' ],
          [ 'entering handler #2' ],
          [ 'processing handler #2' ],
          [ 'entering next #2' ],
          [ 'last handler #2 next' ],
          [ 'entering dequeue #2 jobs in queue' ],
          [ 'removing listener & unlocking' ],
          [ 'dequeueing #1 of #2' ],
          [ 'entering handler #0' ],
          [ 'listening & locking & processing handler #0' ],
          [ 'entering next #0' ],
          [ 'entering handler #1' ],
          [ 'processing handler #1' ],
          [ 'entering next #1' ],
          [ 'entering handler #2' ],
          [ 'processing handler #2' ],
          [ 'entering next #2' ],
          [ 'last handler #2 next' ],
          [ 'entering dequeue #1 jobs in queue' ],
          [ 'removing listener & unlocking' ],
          [ 'dequeueing #1 of #1' ],
          [ 'entering handler #0' ],
          [ 'listening & locking & processing handler #0' ],
          [ 'entering next #0' ],
          [ 'entering handler #1' ],
          [ 'processing handler #1' ],
          [ 'entering next #1' ],
          [ 'entering handler #2' ],
          [ 'processing handler #2' ],
          [ 'entering next #2' ],
          [ 'last handler #2 next' ],
          [ 'entering dequeue #0 jobs in queue' ],
          [ 'removing listener & unlocking' ],
          [ 'no more queue' ],
        ])
      })

    })

    describe('when the second middleware ends', () => {

      it('should behave as normal with one call', async () => {
        await singleCall(app, '/multipleEnd')
        expect(firstHandlerSpy).toHaveBeenCalledTimes(1)
        expect(queuedHandler1Spy).toHaveBeenCalledTimes(1)
        expect(queuedHandler2EndSpy).toHaveBeenCalledTimes(1)
        expect(queuedHandler3Spy).not.toHaveBeenCalled()
        expect(lastHandlerSpy).not.toHaveBeenCalled()
        expect(loggerSillySpy.mock.calls).toEqual([
          [ 'entering handler #0' ],
          [ 'listening & locking & processing handler #0' ],
          [ 'entering next #0' ],
          [ 'entering handler #1' ],
          [ 'processing handler #1' ],
          [ 'response "finish" fired' ],
          [ 'entering dequeue #0 jobs in queue' ],
          [ 'removing listener & unlocking' ],
          [ 'no more queue' ],
        ])
      })

      it('should queue multiple calls', async () => {
        await multipleCall(app, '/multipleEnd')
        expect(firstHandlerSpy).toHaveBeenCalledTimes(3)
        expect(queuedHandler1Spy).toHaveBeenCalledTimes(3)
        expect(queuedHandler2EndSpy).toHaveBeenCalledTimes(3)
        expect(queuedHandler3Spy).not.toHaveBeenCalled()
        expect(lastHandlerSpy).not.toHaveBeenCalled()
        expect(loggerSillySpy.mock.calls).toEqual([
          [ 'entering handler #0' ],
          [ 'listening & locking & processing handler #0' ],
          [ 'entering handler #0' ],
          [ 'locked, queueing in #1' ],
          [ 'entering handler #0' ],
          [ 'locked, queueing in #2' ],
          [ 'entering next #0' ],
          [ 'entering handler #1' ],
          [ 'processing handler #1' ],
          [ 'response "finish" fired' ],
          [ 'entering dequeue #2 jobs in queue' ],
          [ 'removing listener & unlocking' ],
          [ 'dequeueing #1 of #2' ],
          [ 'entering handler #0' ],
          [ 'listening & locking & processing handler #0' ],
          [ 'entering next #0' ],
          [ 'entering handler #1' ],
          [ 'processing handler #1' ],
          [ 'response "finish" fired' ],
          [ 'entering dequeue #1 jobs in queue' ],
          [ 'removing listener & unlocking' ],
          [ 'dequeueing #1 of #1' ],
          [ 'entering handler #0' ],
          [ 'listening & locking & processing handler #0' ],
          [ 'entering next #0' ],
          [ 'entering handler #1' ],
          [ 'processing handler #1' ],
          [ 'response "finish" fired' ],
          [ 'entering dequeue #0 jobs in queue' ],
          [ 'removing listener & unlocking' ],
          [ 'no more queue' ],
        ])
      })

    })

    describe('when the second middleware next with error', () => {

      it('should behave as normal with one call', async () => {
        await singleCall(app, '/multipleError')
        expect(firstHandlerSpy).toHaveBeenCalledTimes(1)
        expect(queuedHandler1Spy).toHaveBeenCalledTimes(1)
        expect(queuedHandler2ErrorSpy).toHaveBeenCalledTimes(1)
        expect(queuedHandler3Spy).not.toHaveBeenCalled()
        expect(lastHandlerSpy).not.toHaveBeenCalled()
        expect(loggerSillySpy.mock.calls).toEqual([
          [ 'entering handler #0' ],
          [ 'listening & locking & processing handler #0' ],
          [ 'entering next #0' ],
          [ 'entering handler #1' ],
          [ 'processing handler #1' ],
          [ 'entering next #1' ],
          [ 'last handler #1 next' ],
          [ 'entering dequeue #0 jobs in queue' ],
          [ 'removing listener & unlocking' ],
          [ 'no more queue' ],
        ])
      })

      it('should queue multiple calls', async () => {
        await multipleCall(app, '/multipleError')
        expect(firstHandlerSpy).toHaveBeenCalledTimes(3)
        expect(queuedHandler1Spy).toHaveBeenCalledTimes(3)
        expect(queuedHandler2ErrorSpy).toHaveBeenCalledTimes(3)
        expect(queuedHandler3Spy).not.toHaveBeenCalled()
        expect(lastHandlerSpy).not.toHaveBeenCalled()
        expect(loggerSillySpy.mock.calls).toEqual([
          [ 'entering handler #0' ],
          [ 'listening & locking & processing handler #0' ],
          [ 'entering handler #0' ],
          [ 'locked, queueing in #1' ],
          [ 'entering handler #0' ],
          [ 'locked, queueing in #2' ],
          [ 'entering next #0' ],
          [ 'entering handler #1' ],
          [ 'processing handler #1' ],
          [ 'entering next #1' ],
          [ 'last handler #1 next' ],
          [ 'entering dequeue #2 jobs in queue' ],
          [ 'removing listener & unlocking' ],
          [ 'dequeueing #1 of #2' ],
          [ 'entering handler #0' ],
          [ 'listening & locking & processing handler #0' ],
          [ 'entering next #0' ],
          [ 'entering handler #1' ],
          [ 'processing handler #1' ],
          [ 'entering next #1' ],
          [ 'last handler #1 next' ],
          [ 'entering dequeue #1 jobs in queue' ],
          [ 'removing listener & unlocking' ],
          [ 'dequeueing #1 of #1' ],
          [ 'entering handler #0' ],
          [ 'listening & locking & processing handler #0' ],
          [ 'entering next #0' ],
          [ 'entering handler #1' ],
          [ 'processing handler #1' ],
          [ 'entering next #1' ],
          [ 'last handler #1 next' ],
          [ 'entering dequeue #0 jobs in queue' ],
          [ 'removing listener & unlocking' ],
          [ 'no more queue' ],
        ])
      })

    })

  })
  
})
