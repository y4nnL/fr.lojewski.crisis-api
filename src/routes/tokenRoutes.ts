import express from 'express'
import * as middleware from '@/middlewares'
import * as tokenService from '@/services/tokenService'
import { authorizationCreateValidation, UserAction } from '@/types'
import { validate } from 'express-validation'

const router = express.Router()

router.route('/authorization')
  .post(
    validate(authorizationCreateValidation),
    middleware.findUserByEmail,
    middleware.authorize(UserAction.TokenAuthorizationCreate),
    tokenService.createAuthorizationToken,
  )
  .delete(
    middleware.findUserByToken,
    middleware.authorize(UserAction.TokenAuthorizationDelete),
    tokenService.deleteAuthorizationToken,
  )

export default router
