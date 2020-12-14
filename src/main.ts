import mongo from './mongo'
import createLogger from './winston'
import app from './express'

const port = 8080
const mainLogger = createLogger('main')

mongo()
  .then(() => {
    app.listen(port, () => {
      mainLogger.info(`Server started at http://localhost:${ port }`)
    })
  })





