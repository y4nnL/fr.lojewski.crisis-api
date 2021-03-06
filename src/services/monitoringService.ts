import assert from '@/utils/assert'
import createLogger from '@/utils/logger'
import { PingRequestHandler, UnauthorizedAPIError } from '@/types'

export const monitoringLogger = createLogger('monitoring')

export const ping: PingRequestHandler = async (request, response, next) => {
  try {
    assert(request.user, new UnauthorizedAPIError('userMandatory'))
    monitoringLogger.pass(`${ request.user } ping OK`)
    response.status(200)
      .json({ pong: true })
  } catch (e) {
    monitoringLogger.error(e)
    next(e)
  }
}
