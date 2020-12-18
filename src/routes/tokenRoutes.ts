import express from 'express'
import * as middleware from '@/middlewares'
import * as tokenService from '@/services/tokenService'
import { validate } from 'express-validation'
import { Token, User } from '@/types'

const router = express.Router()

router.route('/authorization')
  .post(
    validate(Token.Authorization.createValidation),
    middleware.findUserByEmail,
    middleware.authorize(User.Action.TokenAuthorizationCreate),
    tokenService.createAuthorizationToken,
  )
  .delete(
    middleware.findTokenBearer,
    middleware.authorize(User.Action.TokenAuthorizationDelete),
    tokenService.deleteAuthorizationToken,
  )

export default router
