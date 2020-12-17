import assert from 'assert'
import jwt from 'jsonwebtoken'
import * as uuid from 'uuid'

import createLogger from '../logger'
import env from '../env'
import { TokenModel, UserModel } from '../mongo'
import { UnauthorizedAPIError } from '../express'
import { Token, User } from '../types'

const tokenControllerLogger = createLogger('tokenController')

export const createAuthorizationTokenHandler: Token.CreateAuthorizationRequestHandler = async (request, response, next) => {
  try {
    const user = await UserModel.findOne({ email: request.body.email }).exec()
    const canCreate = await user.canPerform(User.Action.CreateAuthorizationToken)
    assert.strictEqual(canCreate, true, `User ${ user.email } is not allowed to create an authorization token`)
    const hasPasswordMatched = await user.matchPassword(request.body.password)
    assert.strictEqual(hasPasswordMatched, true, 'Password mismatch')
    const authToken = new TokenModel()
    authToken.type = Token.Type.Authorization
    authToken.token = uuid.v4()
    authToken.userId = user._id
    await authToken.save()
    tokenControllerLogger.info(`User ${ user.email } successfully created an authorization token`)
    const signOptions = { expiresIn: Token.Duration.Authorization }
    const signedToken = jwt.sign({ token: authToken.token }, env.jwtSecret, signOptions)
    response.json({ token: signedToken })
  } catch (e) {
    tokenControllerLogger.error(e)
    next(new UnauthorizedAPIError())
  }
}

export const deleteAuthorizationTokenHandler: Token.DeleteAuthorizationRequestHandler = async (request, response, next) => {
  if (!request.user) {
    return next(new UnauthorizedAPIError())
  }
  try {
    await TokenModel.find({ userId: request.user._id }).deleteMany().exec()
    tokenControllerLogger.info(`User ${ request.user.email } successfully signed out`)
    response.json({ success: true })
  } catch (e) {
    tokenControllerLogger.error(e)
    next(new UnauthorizedAPIError('Failed to delete authorization tokens'))
  }
}
