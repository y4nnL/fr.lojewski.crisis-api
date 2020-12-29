import createLogger from '@/utils/logger'
import { assert } from '@/utils/assert'
import { BadRequestAPIError, ErrorId, PasswordRequestHandler, UnauthorizedAPIError } from '@/types'
import { isUserPasswordValid } from '@/services/userService'

export const validateUserPasswordLogger = createLogger('validateUserPassword')

export const validateUserPassword: PasswordRequestHandler = async (request, response, next) => {
  try {
    const password = request.body?.password
    assert.isString(password, new BadRequestAPIError([ ErrorId.PasswordRequired ]))
    assert.ok(request.user, new UnauthorizedAPIError(ErrorId.UserMandatory))
    assert.ok(await isUserPasswordValid(request.user, password), new UnauthorizedAPIError(ErrorId.PasswordMismatch))
    validateUserPasswordLogger.pass(`Password OK for ${ request.user }`)
    next()
  } catch (e) {
    validateUserPasswordLogger.error(e)
    next(e)
  }
}
