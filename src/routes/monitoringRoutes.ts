import express from 'express'
import * as middleware from '@/middlewares'
import * as monitoringService from '@/services/monitoringService'
import { UserAction } from '@/types/user'

const router = express.Router()

router.route('/ping')
  .post(
    middleware.findTokenBearer,
    middleware.authorize(UserAction.MonitoringPing),
    monitoringService.ping,
  )

export default router
