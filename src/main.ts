require('module-alias/register')

import createLogger from '@/utils/logger'
import server from '@/core/server'
import { connectDB } from '@/core/db'

const port = 8443
const mainLogger = createLogger('main')

connectDB()
  .then(() => {
    server.listen(port, () => {
      mainLogger.info(`Server started on port ${ port }`)
    })
  })





