import express from 'express'
import * as middleware from '@/middlewares'
import * as tokenService from '@/services/tokenService'
import { authorizationCreateSchema, UnauthorizedAPIError, UserAction } from '@/types'
import { validate } from 'express-validation'

const router = express.Router()
const unauthorized = new UnauthorizedAPIError()

router.route('/authorization')
  .post(
    validate(authorizationCreateSchema, {}, { abortEarly: false }),
    ...middleware.anonymizeError(
      unauthorized,
      middleware.findUserByEmail,
      middleware.validateUserPassword,
      middleware.authorize(UserAction.TokenAuthorizationCreate),
      tokenService.createAuthorizationToken,
    ),
  )
  .delete(
    middleware.findUserByToken,
    middleware.authorize(UserAction.TokenAuthorizationDelete),
    tokenService.deleteAuthorizationToken,
  )

export default router
