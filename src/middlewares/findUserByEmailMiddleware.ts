import createLogger from '@/utils/logger'
import { assert } from '@/utils/assert'
import { BadRequestAPIError, EmailRequestHandler, ErrorId, NotFoundAPIError, UnauthorizedAPIError } from '@/types'
import { UserModel } from '@/models/User'

export const findUserByEmailLogger = createLogger('findUserByEmail')

export const findUserByEmail: EmailRequestHandler = async (request, response, next) => {
  try {
    const email = request.body?.email
    assert.isString(email, new BadRequestAPIError([ ErrorId.EmailRequired ]))
    const userDocument = await UserModel.findOne({ email }).exec()
    assert.ok(userDocument, new NotFoundAPIError())
    request.user = userDocument
    findUserByEmailLogger.pass(`Request user has been set to ${ userDocument }`)
    next()
  } catch (e) {
    findUserByEmailLogger.error(e)
    next(e)
  }
}
