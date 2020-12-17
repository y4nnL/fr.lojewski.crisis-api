import createLogger from './logger'
import mongo from './mongo'
import server from './express'

const port = 8443
const mainLogger = createLogger('main')

mongo()
  .then(() => {
    server.listen(port, () => {
      mainLogger.info(`Server started on port ${ port }`)
    })
  })





