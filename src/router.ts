import express from 'express'
import { validate } from 'express-validation'

import { authorizeMiddleware } from './middlewares/authorizeMiddleware'
import { createAuthorizationTokenHandler, deleteAuthorizationTokenHandler } from './controllers/tokenController'
import { pingMonitoringHandler } from './controllers/monitoringController'
import { Token, User } from './types'

const router = express.Router()

router.route('/monitoring/ping')
  .post(authorizeMiddleware(User.Action.Ping), pingMonitoringHandler)

router.route('/token/authorization')
  .post(validate(Token.createValidation), createAuthorizationTokenHandler)
  .delete(authorizeMiddleware(), deleteAuthorizationTokenHandler)

export default router
