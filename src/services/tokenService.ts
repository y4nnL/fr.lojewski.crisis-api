import assert from 'assert'
import createLogger from '@/utils/logger'
import env from '@/utils/env'
import jwt from 'jsonwebtoken'
import * as uuid from 'uuid'
import { Token, UnauthorizedAPIError, User } from '@/types'
import { TokenModel } from '@/models/Token'

const tokenLogger = createLogger('token')

export const createAuthorizationToken: Token.Authorization.CreateRequestHandler = async (request, response, next) => {
  if (!request.user) {
    return next(new UnauthorizedAPIError())
  }
  const user = request.user
  try {
    const hasPasswordMatched = await user.matchPassword(request.body.password)
    assert.strictEqual(hasPasswordMatched, true, 'Password mismatch')
    const authToken = await TokenModel.create({
      type: Token.Type.Authorization,
      token: uuid.v4(),
      userId: user._id,
    })
    tokenLogger.info(`User ${ user.email } successfully created an authorization token`)
    const signOptions = { expiresIn: Token.Duration.Authorization }
    const signedToken = jwt.sign({ token: authToken.token }, env.jwtSecret, signOptions)
    response.json({ token: signedToken })
  } catch (e) {
    tokenLogger.error(e)
    next(new UnauthorizedAPIError())
  }
}

export const deleteAuthorizationToken: Token.Authorization.DeleteRequestHandler = async (request, response, next) => {
  if (!request.user) {
    return next(new UnauthorizedAPIError())
  }
  const user = request.user
  try {
    await TokenModel.find({ userId: user._id }).deleteMany().exec()
    tokenLogger.info(`User ${ user.email } successfully deleted an authorization token`)
    response.json({ success: true })
  } catch (e) {
    tokenLogger.error(e)
    next(new UnauthorizedAPIError('Failed to delete authorization tokens'))
  }
}
