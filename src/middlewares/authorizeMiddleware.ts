import assert from '@/utils/assert'
import createLogger from '@/utils/logger'
import { canPerform } from '@/services/userService'
import { ErrorId, ForbiddenAPIError, UnauthorizedAPIError, UserAction } from '@/types'
import { RequestHandler } from 'express'

const authorizeLogger = createLogger('authorize')

export const authorize = (action: UserAction, ...actions: UserAction[]): RequestHandler => {
  actions = [ action, ...actions ]
  return async (request, response, next) => {
    try {
      const user = request.user
      assert(user, new UnauthorizedAPIError(ErrorId.UserMandatory))
      const canUserPerform = await Promise.all(actions.map(async (action) => await canPerform(user, action)))
      assert(canUserPerform.every(action => action), new ForbiddenAPIError(ErrorId.ActionUnauthorized))
      authorizeLogger.pass(`${ user } is authorized to perform ${ actions }`)
      next()
    } catch (e) {
      authorizeLogger.debug(e)
      next(e)
    }
  }
}
