// @see https://www.npmjs.com/package/module-alias
require('module-alias/register')

// Environment variables check
require('./utils/env')

import { connectDB } from '@/core/db'
import { startServer } from '@/core/server'

(async function () {
  const isDBConnected = await connectDB()
  if (isDBConnected) {
    startServer()
  }
}())





