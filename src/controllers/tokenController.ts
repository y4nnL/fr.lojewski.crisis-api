import assert from 'assert'
import jwt from 'jsonwebtoken'
import * as uuid from 'uuid'

import createLogger from '@/utils/logger'
import env from '@/utils/env'
import { Token, UnauthorizedAPIError, User } from '@/types'
import { TokenModel } from '@/models/Token'

const tokenLogger = createLogger('token')

export const createAuthorizationToken: Token.Authorization.CreateRequestHandler = async (request, response, next) => {
  if (!request.user) {
    return next(new UnauthorizedAPIError())
  }
  const user = request.user
  try {
    const canCreate = await user.canPerform(User.Action.TokenAuthorizationCreate)
    assert.strictEqual(canCreate, true, `User ${ user.email } is not allowed to create an authorization token`)
    const hasPasswordMatched = await user.matchPassword(request.body.password)
    assert.strictEqual(hasPasswordMatched, true, 'Password mismatch')
    const authToken = new TokenModel()
    authToken.type = Token.Type.Authorization
    authToken.token = uuid.v4()
    authToken.userId = user._id
    await authToken.save()
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
