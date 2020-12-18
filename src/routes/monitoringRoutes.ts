import express from 'express'

import * as middleware from '@/middlewares'
import * as monitoringService from '@/services/monitoringService'
import { User } from '@/types'

const router = express.Router()

router.route('/ping')
  .post(
    middleware.findTokenBearer,
    middleware.authorize(User.Action.MonitoringPing),
    monitoringService.ping,
  )

export default router
