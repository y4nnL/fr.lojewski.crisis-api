import assert from 'assert'
import createLogger from '@/utils/logger'
import env from '@/utils/env'
import jwt from 'jsonwebtoken'
import * as token from '@/types/token'
import { TokenModel } from '@/models/Token'
import { UnauthorizedAPIError } from '@/types'
import { v4 as uuidV4 } from 'uuid'

const tokenLogger = createLogger('token')

export const createAuthorizationToken: token.AuthorizationCreateRequestHandler = async (request, response, next) => {
  if (!request.user) {
    return next(new UnauthorizedAPIError())
  }
  const user = request.user
  try {
    const hasPasswordMatched = await user.matchPassword(request.body.password)
    assert.strictEqual(hasPasswordMatched, true, 'Password mismatch')
    const authToken = await TokenModel.create({
      type: token.TokenType.Authorization,
      token: uuidV4(),
      userId: user._id,
    })
    tokenLogger.info(`${ user } successfully created an authorization token`)
    const signOptions = { expiresIn: token.TokenDuration.Authorization }
    const signedToken = jwt.sign({ token: authToken.token }, env.jwtSecret, signOptions)
    response.json({ token: signedToken })
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
