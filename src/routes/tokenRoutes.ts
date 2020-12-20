import express from 'express'
import * as middleware from '@/middlewares'
import * as tokenService from '@/services/tokenService'
import { validate } from 'express-validation'
import { Token } from '@/types'
import { UserAction } from '@/types/user'

const router = express.Router()

router.route('/authorization')
  .post(
    validate(Token.Authorization.createValidation),
    middleware.findUserByEmail,
    middleware.authorize(UserAction.TokenAuthorizationCreate),
    tokenService.createAuthorizationToken,
  )
  .delete(
    middleware.findTokenBearer,
    middleware.authorize(UserAction.TokenAuthorizationDelete),
    tokenService.deleteAuthorizationToken,
  )

export default router
