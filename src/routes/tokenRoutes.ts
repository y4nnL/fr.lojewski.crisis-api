import express from 'express'
import { validate } from 'express-validation'

import * as middleware from '@/middlewares'
import * as tokenController from '@/controllers/tokenController'
import { Token, User } from '@/types'

const router = express.Router()

router.route('/authorization')
  .post(
    validate(Token.Authorization.createValidation),
    middleware.findUserByEmail,
    middleware.authorize(User.Action.TokenAuthorizationCreate),
    tokenController.createAuthorizationToken,
  )
  .delete(
    middleware.findTokenBearer,
    middleware.authorize(User.Action.TokenAuthorizationDelete),
    tokenController.deleteAuthorizationToken,
  )

export default router
