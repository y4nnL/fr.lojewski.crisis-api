import express, { RequestHandler, Request, Response } from 'express'

const router = express.Router()

const rootHandler: RequestHandler = (request: Request, response: Response) => {
  response.send('OK')
}

router.use('/', rootHandler)

export default router
