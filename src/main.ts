import mongoose from 'mongoose'
import createLogger from './logger'

import app from './express'

const port = 8080
const mainLogger = createLogger('main')

function connectDB() {
  const db = process.env.DB_URI.split('/').pop()
  return mongoose.connect(process.env.DB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    })
    .then(() => mainLogger.info(`Connected to MongoDB "${ db }"`))
    .catch(() => mainLogger.error(`Unable to connect to MongoDB "${ db }"`))
}

connectDB()
  .then(() => {
    app.listen(port, () => {
      mainLogger.info(`Server started at http://localhost:${ port }`)
    })
  })





