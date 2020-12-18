// @see https://www.npmjs.com/package/module-alias
require('module-alias/register')

import { connectDB } from '@/core/db'
import { startServer } from '@/core/server'

connectDB()
  .then(startServer)





