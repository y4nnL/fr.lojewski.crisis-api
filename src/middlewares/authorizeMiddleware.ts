import assert from 'assert'
import { RequestHandler } from 'express'

import createLogger from '@/logger'
import { User } from '@/types'
import { UnauthorizedAPIError } from '@/express'

const authorizeMiddlewareLogger = createLogger('authorize')

export const authorize = (...actions: User.Action[]): RequestHandler => async (request, response, next) => {
  if (!request.user) {
    return next(new UnauthorizedAPIError())
  }
  const user = request.user
  try {
    const canUserPerform = await Promise.all(actions.map(async (action) => await user.canPerform(action)))
    assert.strictEqual(canUserPerform.indexOf(false) < 0, true,
      `User ${ user.email } can not perform one of the actions [ ${ actions.join(', ') } ]`)
    authorizeMiddlewareLogger.info(`User ${ user.email } has been authorized to perform [ ${ actions.join((', ')) } ]`)
    next()
  } catch (e) {
    authorizeMiddlewareLogger.error(e)
    next(new UnauthorizedAPIError())
  }
}
