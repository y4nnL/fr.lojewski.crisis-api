import createLogger from '@/utils/logger'
import env from '@/utils/env'
import jwt from 'jsonwebtoken'
import { assert } from '@/utils/assert'
import {
  AuthorizationCreateRequestHandler,
  AuthorizationDeleteRequestHandler,
  TokenDuration,
  TokenType,
  UnauthorizedAPIError,
} from '@/types'
import { Token, TokenDocument, TokenModel } from '@/models'
import { v4 as uuidV4 } from 'uuid'

type JWTToken = {
  token: string
}

export const tokenLogger = createLogger('token')

export const encodeToken = (rawToken: string, expiresIn: TokenDuration): string => {
  return jwt.sign(<JWTToken>{ token: rawToken }, env.jwtSecret, { expiresIn })
}

export const decodeToken = (signedToken: string, maxAge: TokenDuration): string | null => {
  try {
    const decoded = <JWTToken>jwt.verify(signedToken, env.jwtSecret, { maxAge })
    assert.isObject(decoded)
    assert.isString(decoded.token)
    return decoded.token
  } catch (e) {
    return null
  }
}

export const createAuthorizationToken: AuthorizationCreateRequestHandler = async (request, response, next) => {
  try {
    assert.ok(request.user, new UnauthorizedAPIError('userMandatory'))
    const token: Token = {
      token: uuidV4(),
      type: TokenType.Authorization,
      userId: request.user._id,
    }
    const encodedToken = encodeToken(token.token, TokenDuration.Authorization)
    await TokenModel.create(token as TokenDocument)
    tokenLogger.pass(`Created an authorization token for ${ request.user }`)
    response.status(200)
      .json({ token: encodedToken })
  } catch (e) {
    tokenLogger.error(e)
    next(e)
  }
}

export const deleteAuthorizationToken: AuthorizationDeleteRequestHandler = async (request, response, next) => {
  try {
    assert.ok(request.user, new UnauthorizedAPIError('userMandatory'))
    await TokenModel.find({ userId: request.user._id, type: TokenType.Authorization }).deleteMany().exec()
    tokenLogger.pass(`Deleted all the authorization tokens for ${ request.user }`)
    response.status(200)
      .json({ success: true })
  } catch (e) {
    tokenLogger.error(e)
    next(e)
  }
}
