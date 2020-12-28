import express from 'express'
import * as middleware from '@/middlewares'
import * as tokenService from '@/services/tokenService'
import { authorizationCreateSchema, UserAction } from '@/types'
import { validate } from 'express-validation'

const router = express.Router()

router.route('/authorization')
  .post(
    validate(authorizationCreateSchema, {}, { abortEarly: false }),
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
