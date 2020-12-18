import express from 'express'

import * as middleware from '@/middlewares'
import * as monitoringController from '@/controllers/monitoringController'
import { User } from '@/types'

const router = express.Router()

router.route('/ping')
  .post(
    middleware.findTokenBearer,
    middleware.authorize(User.Action.MonitoringPing),
    monitoringController.ping,
  )

export default router
