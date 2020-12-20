import assert from 'assert'
import createLogger from '@/utils/logger'
import env from '@/utils/env'
import jwt from 'jsonwebtoken'
import { RequestHandler } from 'express'
import { TokenDocument, TokenModel } from '@/models/Token'
import { TokenType, TokenDuration } from '@/types/token'
import { UnauthorizedAPIError } from '@/types/error'
import { UserModel } from '@/models/User'

const findTokenBearerLogger = createLogger('findTokenBearer')

export const findTokenBearer: RequestHandler = async (request, response, next) => {
  try {
    assert.strictEqual(!!request.get('X-Authorization'), true, 'Authorization header not found')
    const authorization = request.get('X-Authorization').slice(7)
    const verifyOptions = { maxAge: TokenDuration.Authorization }
    const tokenDocument: TokenDocument = <TokenDocument>jwt.verify(authorization, env.jwtSecret, verifyOptions)
    const authToken = await TokenModel.findOne({ token: tokenDocument.token }).exec()
    assert.strictEqual(authToken?.type, TokenType.Authorization, 'Token not found or token type mismatch')
    const user = await UserModel.findById(authToken.userId).exec()
    request.user = user
    findTokenBearerLogger.info(`Token bearer ${ user } has been found`)
    next()
  } catch (e) {
    findTokenBearerLogger.error(e)
    next(new UnauthorizedAPIError())
  }
}
