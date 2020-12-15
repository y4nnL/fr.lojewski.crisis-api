import express from 'express'
import jwt from 'jsonwebtoken'
import httpStatus from 'http-status'
import * as uuid from 'uuid'
import { Joi, validate } from 'express-validation'
import { RequestHandler, Request, Response, NextFunction } from 'express'

import createLogger from './winston'
import env from './env'
import { APIError } from './express'
import { TokenModel, User, UserModel } from './mongo'

const routerLogger = createLogger('router')

const authSignInValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().regex(/[a-zA-Z0-9]{8,30}/).required(),
  }),
}

interface AuthSignInBody {
  email: string
  password: string
}

const router = express.Router()

const authSignInHandler: RequestHandler =
  async (request: Request<{}, {}, AuthSignInBody>, response: Response, next: NextFunction) => {
    let user: User = null
    try {
      user = await UserModel.findOne({ email: request.body.email }).exec()
    } catch (e) {
      next(e)
    }
    if (user) {
      const isPasswordChecked = await user.checkPassword(request.body.password)
      if (isPasswordChecked && user.password && user.isValidated && !user.isDisabled) {
        const authToken = new TokenModel()
        authToken.type = 'auth'
        authToken.token = uuid.v4()
        authToken.userId = user._id
        try {
          await authToken.save()
          routerLogger.info(`User ${ user.email } successfully signed in`)
          response.json({ token: jwt.sign({ token: authToken.token }, env.jwtSecret, { expiresIn: '1w' }) })
        } catch (e) {
          next(e)
        }
      } else {
        next(new APIError(httpStatus[401], httpStatus.UNAUTHORIZED))
      }
    } else {
      next(new APIError(httpStatus[404], httpStatus.NOT_FOUND))
    }
  }

router.route('/auth/sign-in')
  .post(
    validate(authSignInValidation),
    authSignInHandler,
  )

export default router
