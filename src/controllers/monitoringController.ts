import createLogger from '@/utils/logger'
import { Monitoring } from '@/types'
import { UnauthorizedAPIError } from '@/core/express'

const monitoringControllerLogger = createLogger('monitoring')

export const monitoringPing: Monitoring.PingRequestHandler = async (request, response, next) => {
  if (!request.user) {
    return next(new UnauthorizedAPIError())
  }
  monitoringControllerLogger.info(`Ping from User ${ request.user.email }`)
  response.json({ pong: true })
}
