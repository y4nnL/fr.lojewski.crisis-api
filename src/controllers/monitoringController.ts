import createLogger from '@/utils/logger'
import { Monitoring, UnauthorizedAPIError } from '@/types'

const monitoringLogger = createLogger('monitoring')

export const monitoringPing: Monitoring.PingRequestHandler = async (request, response, next) => {
  if (!request.user) {
    return next(new UnauthorizedAPIError())
  }
  monitoringLogger.info(`Ping from User ${ request.user.email }`)
  response.json({ pong: true })
}
