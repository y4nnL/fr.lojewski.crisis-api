import assert from 'assert'
import createLogger from '@/utils/logger'
import { EmailRequestHandler, UnauthorizedAPIError } from '@/types'
import { UserModel } from '@/models/User'

const findUserByEmailLogger = createLogger('findUserByEmail')

export const findUserByEmail: EmailRequestHandler = async (request, response, next) => {
  try {
    assert.strictEqual(request.body?.email !== '', true, 'An email must be provided')
    const user = await UserModel.findOne({ email: request.body.email }).exec()
    assert.strictEqual(user?.email, request.body.email, `[User ${ request.body.email }] not found`)
    request.user = user
    findUserByEmailLogger.info(`Found ${ user }`)
    next()
  } catch (e) {
    findUserByEmailLogger.error(e)
    next(new UnauthorizedAPIError())
  }
}
