import assert from '@/utils/assert'
import createLogger from '@/utils/logger'
import env from '@/utils/env'
import jwt from 'jsonwebtoken'
import nodeAssert from 'assert'
import * as token from '@/types/token'
import { Token, TokenDocument, TokenModel } from '@/models'
import { TokenDuration, UnauthorizedAPIError } from '@/types'
import { v4 as uuidV4 } from 'uuid'

type jwtToken = {
  token: string
}

const tokenLogger = createLogger('token')

export const encodeToken = (rawToken: string, expiresIn: string): string => {
  return jwt.sign(<jwtToken>{ token: rawToken }, env.jwtSecret, { expiresIn })
}

export const decodeToken = (signedToken: string, maxAge: string): string | null => {
  try {
    const decoded = <jwtToken>jwt.verify(signedToken, env.jwtSecret, { maxAge })
    assert.isObject(decoded)
    assert.isString(decoded.token)
    return decoded.token
  } catch (e) {
    return null
  }
}

export const createAuthorizationToken: token.AuthorizationCreateRequestHandler = async (request, response, next) => {
  if (!request.user) {
    return next(new UnauthorizedAPIError())
  }
  const user = request.user
  try {
    const hasPasswordMatched = await user.matchPassword(request.body.password)
    nodeAssert.strictEqual(hasPasswordMatched, true, 'Password mismatch')
    const authorizationToken = await TokenModel.create({
      type: token.TokenType.Authorization,
      token: uuidV4(),
      userId: user._id,
    } as Token as TokenDocument)
    tokenLogger.info(`${ user } successfully created an authorization token`)
    response.json({ token: encodeToken(authorizationToken.token, TokenDuration.Authorization) })
  } catch (e) {
    tokenLogger.error(e)
    next(new UnauthorizedAPIError())
  }
}

export const deleteAuthorizationToken: token.AuthorizationDeleteRequestHandler = async (request, response, next) => {
  if (!request.user) {
    return next(new UnauthorizedAPIError())
  }
  const user = request.user
  try {
    await TokenModel.find({ userId: user._id }).deleteMany().exec()
    tokenLogger.info(`Deleted authorization token for ${ user }`)
    response.json({ success: true })
  } catch (e) {
    tokenLogger.error(e)
    next(new UnauthorizedAPIError())
  }
}
