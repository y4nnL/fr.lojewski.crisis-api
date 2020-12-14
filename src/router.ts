import express, { RequestHandler, Request, Response } from 'express'

import { UserModel } from './mongo'

const router = express.Router()

const rootHandler: RequestHandler = async (request: Request, response: Response) => {
  let user: any = null
  try {
    const users = await UserModel.where('firstName').equals('Yann').exec()
    user = users[0]
  } catch (e) {
  }
  response.json(user)
}

router.use('/', rootHandler)

export default router
