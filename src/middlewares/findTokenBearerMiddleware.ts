import assert from 'assert'
import jwt from 'jsonwebtoken'
import { RequestHandler } from 'express'

import createLogger from '@/utils/logger'
import env from '@/utils/env'
import { Token } from '@/types'
import { TokenDocument, TokenModel } from '@/models/Token'
import { UnauthorizedAPIError } from '@/core/express'
import { UserModel } from '@/models/User'

const findTokenBearerLogger = createLogger('findTokenBearer')

export const findTokenBearer: RequestHandler = async (request, response, next) => {
  try {
    assert.strictEqual(!!request.get('X-Authorization'), true, 'Authorization header not found')
    const authorization = request.get('X-Authorization').slice(7)
    const verifyOptions = { maxAge: Token.Duration.Authorization }
    const tokenDocument: TokenDocument = <TokenDocument>jwt.verify(authorization, env.jwtSecret, verifyOptions)
    const authToken = await TokenModel.findOne({ token: tokenDocument.token }).exec()
    assert.strictEqual(authToken?.type, Token.Type.Authorization, 'Token not found or token type mismatch')
    const user = await UserModel.findById(authToken.userId).exec()
    request.user = user
    findTokenBearerLogger.info(`Token bearer has been found (User ${ user.email })`)
    next()
  } catch (e) {
    findTokenBearerLogger.error(e)
    next(new UnauthorizedAPIError())
  }
}
