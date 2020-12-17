import assert from 'assert'
import express from 'express'
import jwt from 'jsonwebtoken'
import * as uuid from 'uuid'
import { Joi, validate } from 'express-validation'
import { Request, RequestHandler } from 'express'

import createLogger from './winston'
import env from './env'
import { UnauthorizedAPIError } from './express'
import { Method, Token, TokenModel, TokenType, User, UserModel } from './mongo'

declare global {
  namespace Express {
    interface Request {
      user?: User
    }
  }
}

interface AuthSignInBody {
  email: string
  password: string
}

const TOKEN_DURATION = '1w'

const authSignInValidation = {
  body: Joi.object({
    email: Joi.string().email().required(),
    password: Joi.string().regex(/[a-zA-Z0-9]{8,30}/).required(),
  }),
}

const routerLogger = createLogger('router')
const router = express.Router()

const authorize = (...methods: Method[]): RequestHandler => async (request, response, next) => {
  const header = request.get('X-Authorization')
  const authorization = header ? header.slice(7) : ''
  try {
    const tokenData: Token = <Token>jwt.verify(authorization, env.jwtSecret, { maxAge: TOKEN_DURATION })
    const authToken = await TokenModel.findOne({ token: tokenData.token }).exec()
    assert.strictEqual(authToken.type, TokenType.Authorization)
    const user = await UserModel.findById(authToken.userId).exec()
    if (methods.length) {
      const userCan = await Promise.all(methods.map(async (method) => await user.can(method)))
      assert.strictEqual(userCan.indexOf(false) < 0, true)
    }
    request.user = user
    routerLogger.info(`Token bearer is authorized (email:${ user.email })`)
    next()
  } catch (e) {
    // TODO <yann> It would be better considering a cron operation to clean up the tokens in the database
    if (authorization) {
      try {
        const tokenData: Token = <Token>jwt.decode(authorization)
        await TokenModel.find({ token: tokenData.token }).deleteMany().exec()
      } catch (e) {
      }
    }
    routerLogger.error(e)
    next(new UnauthorizedAPIError())
  }
}

const pingHandler: RequestHandler = async (request, response) => {
  response.json({ pong: true })
}

const authSignInHandler: RequestHandler = async (request: Request<{}, {}, AuthSignInBody>, response, next) => {
  try {
    const user = await UserModel.findOne({ email: request.body.email }).exec()
    if (user) {
      const isPasswordChecked = await user.checkPassword(request.body.password)
      if (user.password && user.isValidated && !user.isDisabled && isPasswordChecked) {
        const authToken = new TokenModel()
        authToken.type = TokenType.Authorization
        authToken.token = uuid.v4()
        authToken.userId = user._id
        try {
          await authToken.save()
          routerLogger.info(`User ${ user.email } successfully signed in`)
          response.json({ token: jwt.sign({ token: authToken.token }, env.jwtSecret, { expiresIn: TOKEN_DURATION }) })
        } catch (e) {
          routerLogger.error(e)
          next(new UnauthorizedAPIError())
        }
      } else {
        next(new UnauthorizedAPIError())
      }
    } else {
      next(new UnauthorizedAPIError())
    }
  } catch (e) {
    routerLogger.error(e)
    next(new UnauthorizedAPIError())
  }
}

const authSignOutHandler: RequestHandler = async (request, response, next) => {
  try {
    await TokenModel.find({ userId: request.user._id }).deleteMany().exec()
    routerLogger.info(`User ${ request.user.email } successfully signed out`)
    response.json({ success: true })
  } catch (e) {
    routerLogger.error(e)
    next(new UnauthorizedAPIError('Failed to delete authorization tokens'))
  }
}

router.route('/ping')
  .get(
    authorize(),
    pingHandler,
  )

router.route('/auth/sign-in')
  .post(
    validate(authSignInValidation),
    authSignInHandler,
  )

router.route('/auth/sign-out')
  .get(
    authorize(),
    authSignOutHandler,
  )

export default router
