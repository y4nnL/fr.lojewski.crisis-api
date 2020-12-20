import express from 'express'
import * as middleware from '@/middlewares'
import * as tokenService from '@/services/tokenService'
import { validate } from 'express-validation'
import { authorizationCreateValidation, UserAction } from '@/types'

const router = express.Router()

router.route('/authorization')
  .post(
    validate(authorizationCreateValidation),
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
