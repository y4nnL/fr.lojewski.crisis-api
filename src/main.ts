import server from './express'
import mongo from './mongo'
import createLogger from './winston'

const port = 8443
const mainLogger = createLogger('main')

mongo()
  .then(() => {
    server.listen(port, () => {
      mainLogger.info(`Server started on port ${ port }`)
    })
  })





