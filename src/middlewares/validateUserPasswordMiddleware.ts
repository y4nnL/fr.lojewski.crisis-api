import createLogger from '@/utils/logger'
import { assert } from '@/utils/assert'
import { BadRequestAPIError, PasswordRequestHandler, UnauthorizedAPIError } from '@/types'
import { isUserPasswordValid } from '@/services/userService'

export const validateUserPasswordLogger = createLogger('validateUserPassword')

export const validateUserPassword: PasswordRequestHandler = async (request, response, next) => {
  try {
    const password = request.body?.password
    assert.isString(password, new BadRequestAPIError([ 'passwordRequired' ]))
    assert.ok(request.user, new UnauthorizedAPIError('userMandatory'))
    assert.ok(await isUserPasswordValid(request.user, password), new UnauthorizedAPIError('passwordMismatch'))
    validateUserPasswordLogger.pass(`Password OK for ${ request.user }`)
    next()
  } catch (e) {
    validateUserPasswordLogger.error(e)
    next(e)
  }
}
