import createLogger from '@/utils/logger'
import { Monitoring, UnauthorizedAPIError } from '@/types'

const monitoringLogger = createLogger('monitoring')

export const ping: Monitoring.PingRequestHandler = async (request, response, next) => {
  if (!request.user) {
    return next(new UnauthorizedAPIError())
  }
  monitoringLogger.info(`${ request.user } ping OK`)
  response.json({ pong: true })
}
