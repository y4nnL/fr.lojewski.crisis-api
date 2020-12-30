import assert from '@/utils/assert'
import createLogger from '@/utils/logger'
import { canUserPerform } from '@/services/userService'
import { ErrorId, ForbiddenAPIError, UnauthorizedAPIError, UserAction } from '@/types'
import { RequestHandler } from 'express'

const authorizeLogger = createLogger('authorize')

export const authorize = (action: UserAction, ...actions: UserAction[]): RequestHandler => {
  actions = [ action, ...actions ]
  return async (request, response, next) => {
    try {
      const user = request.user
      assert(user, new UnauthorizedAPIError(ErrorId.UserMandatory))
      const isAuthorized = actions.every((action) => canUserPerform(user, action))
      assert(isAuthorized, new ForbiddenAPIError(ErrorId.ActionUnauthorized))
      authorizeLogger.pass(`${ user } is authorized to perform ${ actions }`)
      next()
    } catch (e) {
      authorizeLogger.error(e)
      next(e)
    }
  }
}
