import assert from '@/utils/assert'
import createLogger from '@/utils/logger'
import { BadRequestAPIError, ErrorId, NotFoundAPIError, TokenDuration, TokenType, UnauthorizedAPIError } from '@/types'
import { decodeToken } from '@/services/tokenService'
import { RequestHandler } from 'express'
import { TokenModel } from '@/models/Token'

export const findTokenBearerLogger = createLogger('findTokenBearer')

export const findTokenBearer: RequestHandler = async (request, response, next) => {
  try {
    let authorization = request.get('X-Authorization')
    assert(authorization, new BadRequestAPIError([ ErrorId.AuthorizationNotFound ]))
    assert(/^Bearer /.test(authorization), new BadRequestAPIError([ ErrorId.AuthorizationNotFound ]))
    const token = decodeToken(authorization.slice(7), TokenDuration.Authorization)
    assert(token, new BadRequestAPIError([ ErrorId.AuthorizationMalformed ]))
    const tokenDocument = await TokenModel.findOne({ token, type: TokenType.Authorization }).exec()
    assert(tokenDocument, new NotFoundAPIError())
    const userDocument = await tokenDocument.getUser()
    assert(userDocument, new UnauthorizedAPIError(ErrorId.UserMandatory))
    request.user = userDocument
    findTokenBearerLogger.pass(`Token bearer ${ userDocument } has been found`)
    next()
  } catch (e) {
    findTokenBearerLogger.error(e)
    next(new UnauthorizedAPIError())
  }
}
