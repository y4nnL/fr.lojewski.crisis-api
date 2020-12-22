// @see https://www.npmjs.com/package/module-alias
require('module-alias/register')

// Environment variables check
require('./utils/env')

import { connect } from '@/core/db'
import { startServer } from '@/core/server'

(async function () {
  const isDBConnected = await connect()
  if (isDBConnected) {
    startServer()
  }
}())





