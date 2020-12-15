import express from 'express'
import jwt from 'jsonwebtoken'
import * as uuid from 'uuid'
import { Joi, validate } from 'express-validation'
import { RequestHandler, Request, Response, NextFunction } from 'express'

import createLogger from './winston'
import env from './env'
import { UnauthorizedAPIError } from './express'
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
    try {
      const user = await UserModel.findOne({ email: request.body.email }).exec()
      if (user) {
        const isPasswordChecked = await user.checkPassword(request.body.password)
        if (user.password && user.isValidated && !user.isDisabled && isPasswordChecked) {
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
          next(new UnauthorizedAPIError())
        }
      } else {
        next(new UnauthorizedAPIError())
      }
    } catch (e) {
      next(e)
    }
  }

router.route('/auth/sign-in')
  .post(
    validate(authSignInValidation),
    authSignInHandler,
  )

export default router
