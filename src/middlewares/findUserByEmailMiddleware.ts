import assert from 'assert'

import createLogger from '@/utils/logger'
import { EmailRequestHandler, UnauthorizedAPIError } from '@/types'
import { UserModel } from '@/models/User'

const findUserByEmailMiddlewareLogger = createLogger('findUserByEmail')

export const findUserByEmail: EmailRequestHandler = async (request, response, next) => {
  try {
    assert.strictEqual(request.body?.email !== '', true, 'An email must be provided')
    const user = await UserModel.findOne({ email: request.body.email }).exec()
    assert.strictEqual(user?.email, request.body.email, `User ${ request.body.email } not found`)
    request.user = user
    findUserByEmailMiddlewareLogger.info(`User ${ user.email } has been found`)
    next()
  } catch (e) {
    findUserByEmailMiddlewareLogger.error(e)
    next(new UnauthorizedAPIError())
  }
}
