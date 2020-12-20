import assert from '@/utils/assert'
import createLogger from '@/utils/logger'
import { ErrorId, ForbiddenAPIError, UnauthorizedAPIError } from '@/types/error'
import { RequestHandler } from 'express'
import { UserAction } from '@/types/user'

const authorizeLogger = createLogger('authorize')

export const authorize = (action: UserAction, ...actions: UserAction[]): RequestHandler => {
  actions = [ action, ...actions ]
  return async (request, response, next) => {
    try {
      const user = request.user
      assert(user, new UnauthorizedAPIError(ErrorId.UserMandatory))
      const canUserPerform = await Promise.all(actions.map(async (action) => await user.canPerform(action)))
      assert(canUserPerform.every(action => action), new ForbiddenAPIError(ErrorId.ActionUnauthorized))
      authorizeLogger.pass(`${ user } is authorized to perform ${ actions }`)
      next()
    } catch (e) {
      authorizeLogger.debug(e)
      next(e)
    }
  }
}
