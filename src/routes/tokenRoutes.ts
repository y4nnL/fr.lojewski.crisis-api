import express from 'express'

import { authorize } from '@/middlewares/authorizeMiddleware'
import { findTokenBearer } from '@/middlewares/findTokenBearerMiddleware'
import { findUserByEmail } from '@/middlewares/findUserByEmailMiddleware'
import { Token, User } from '@/types'
import { tokenAuthorizationCreate, tokenAuthorizationDelete } from '@/controllers/tokenController'
import { validate } from 'express-validation'

const router = express.Router()

router.route('/authorization')
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
