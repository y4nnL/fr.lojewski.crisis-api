import assert from '@/utils/assert'
import createLogger from '@/utils/logger'
import { BadRequestAPIError, EmailRequestHandler, ErrorId, NotFoundAPIError, UnauthorizedAPIError } from '@/types'
import { UserModel } from '@/models/User'

export const findUserByEmailLogger = createLogger('findUserByEmail')

export const findUserByEmail: EmailRequestHandler = async (request, response, next) => {
  try {
    assert(request?.body?.email, new BadRequestAPIError([ ErrorId.EmailRequired ]))
    const user = await UserModel.findOne({ email: request.body.email }).exec()
    assert.strictEqual(user?.email, request.body.email, new NotFoundAPIError())
    request.user = user
    findUserByEmailLogger.pass(`Found ${ user }`)
    next()
  } catch (e) {
    findUserByEmailLogger.error(e)
    next(new UnauthorizedAPIError())
  }
}
