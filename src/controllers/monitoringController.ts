import createLogger from '../logger'
import { Monitoring } from '../types'
import { UnauthorizedAPIError } from '../express'

const monitoringControllerLogger = createLogger('monitoringController')

export const pingMonitoringHandler: Monitoring.PingRequestHandler = async (request, response, next) => {
  if (!request.user) {
    return next(new UnauthorizedAPIError())
  }
  monitoringControllerLogger.info(`Ping from User ${ request.user.email }`)
  response.json({ pong: true })
}
