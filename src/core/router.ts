import express from 'express'
import { validate } from 'express-validation'

import { authorize } from '@/middlewares/authorizeMiddleware'
import { findTokenBearer } from '@/middlewares/findTokenBearerMiddleware'
import { findUserByEmail } from '@/middlewares/findUserByEmailMiddleware'
import { monitoringPing } from '@/controllers/monitoringController'
import { Token, User } from '@/types'
import { tokenAuthorizationCreate, tokenAuthorizationDelete } from '@/controllers/tokenController'

const router = express.Router()

router.route('/monitoring/ping')
  .post(
    findTokenBearer,
    authorize(User.Action.MonitoringPing),
    monitoringPing,
  )

router.route('/token/authorization')
  .post(
    validate(Token.createValidation),
    findUserByEmail,
    authorize(User.Action.TokenAuthorizationCreate),
    tokenAuthorizationCreate,
  )
  .delete(
    findTokenBearer,
    authorize(User.Action.TokenAuthorizationDelete),
    tokenAuthorizationDelete,
  )

export default router
