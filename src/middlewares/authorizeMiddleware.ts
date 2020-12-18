import assert from 'assert'
import createLogger from '@/utils/logger'
import { RequestHandler } from 'express'
import { UnauthorizedAPIError, User } from '@/types'

const authorizeLogger = createLogger('authorize')

export const authorize = (...actions: User.Action[]): RequestHandler => async (request, response, next) => {
  if (!request.user) {
    return next(new UnauthorizedAPIError())
  }
  const user = request.user
  try {
    const canUserPerform = await Promise.all(actions.map(async (action) => await user.canPerform(action)))
    const actionsToString = actions.map((a) => `"${ a }"`).join(' or ')
    assert.strictEqual(canUserPerform.indexOf(false) < 0, true,
      `${ user } is not authorized to perform ${ actionsToString }`)
    authorizeLogger.info(`${ user } is authorized to perform ${ actionsToString }`)
    next()
  } catch (e) {
    authorizeLogger.error(e)
    next(new UnauthorizedAPIError())
  }
}
