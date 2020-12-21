import assert from 'assert'
import createLogger from '@/utils/logger'
import env from '@/utils/env'
import jwt from 'jsonwebtoken'
import { RequestHandler } from 'express'
import { TokenDocument, TokenModel } from '@/models/Token'
import { TokenType, TokenDuration, UnauthorizedAPIError, BadRequestAPIError, ErrorId, NotFoundAPIError } from '@/types'
import { UserModel } from '@/models/User'

export const findTokenBearerLogger = createLogger('findTokenBearer')

export const getTokenFromAuthorization = (authorization: string): TokenDocument | null => {
  try {
    return jwt.verify<TokenDocument>(authorization, env.jwtSecret, { maxAge: TokenDuration.Authorization })
  } catch (e) {
    return null
  }
}

export const findTokenBearer: RequestHandler = async (request, response, next) => {
  try {
    const authorization = request.get('X-Authorization')
    assert(authorization, new BadRequestAPIError([ ErrorId.AuthorizationNotFound ]))
    const tokenDocument = getTokenFromAuthorization(authorization)
    assert(tokenDocument, new BadRequestAPIError([ ErrorId.AuthorizationMalformed ]))
    const authToken = await TokenModel.findOne({ token: tokenDocument.token, type: TokenType.Authorization }).exec()
    assert(authToken, new NotFoundAPIError())
    const user = await UserModel.findById(authToken.userId).exec()
    assert(user, new UnauthorizedAPIError(ErrorId.UserMandatory))
    request.user = user
    findTokenBearerLogger.pass(`Token bearer ${ user } has been found`)
    next()
  } catch (e) {
    findTokenBearerLogger.error(e)
    next(new UnauthorizedAPIError())
  }
}
