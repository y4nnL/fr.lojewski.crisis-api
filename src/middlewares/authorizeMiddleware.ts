import assert from 'assert'
import jwt from 'jsonwebtoken'
import { RequestHandler } from 'express'

import createLogger from '../logger'
import env from '../env'
import { Token, User } from '../types'
import { TokenDocument, TokenModel, UserModel } from '../mongo'
import { UnauthorizedAPIError } from '../express'

const authorizeMiddlewareLogger = createLogger('authorizeMiddleware')

export const authorizeMiddleware = (...actions: User.Action[]): RequestHandler => async (request, response, next) => {
  const header = request.get('X-Authorization')
  const authorization = header ? header.slice(7) : ''
  try {
    const verifyOptions = { maxAge: Token.Duration.Authorization }
    const tokenDocument: TokenDocument = <TokenDocument>jwt.verify(authorization, env.jwtSecret, verifyOptions)
    const authToken = await TokenModel.findOne({ token: tokenDocument.token }).exec()
    assert.strictEqual(authToken?.type, Token.Type.Authorization, 'Token not found or token type mismatch')
    const user = await UserModel.findById(authToken.userId).exec()
    const canUserPerform = await Promise.all(actions.map(async (action) => await user.canPerform(action)))
    assert.strictEqual(canUserPerform.indexOf(false) < 0, true,
      `User ${ user.email } can not perform one of the actions [ ${ actions.join(', ') } ]`)
    request.user = user
    authorizeMiddlewareLogger.info(`Token bearer is authorized (User ${ user.email })`)
    next()
  } catch (e) {
    // TODO <yann> It would be better considering a cron operation to clean up the tokens in the database
    if (authorization) {
      try {
        const tokenDocument: TokenDocument = <TokenDocument>jwt.decode(authorization)
        await TokenModel.find({ token: tokenDocument.token }).deleteMany().exec()
      } catch (e) {
      }
    }
    authorizeMiddlewareLogger.error(e)
    next(new UnauthorizedAPIError())
  }
}
