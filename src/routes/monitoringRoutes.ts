import express from 'express'

import { authorize } from '@/middlewares/authorizeMiddleware'
import { findTokenBearer } from '@/middlewares/findTokenBearerMiddleware'
import { monitoringPing } from '@/controllers/monitoringController'
import { User } from '@/types'

const router = express.Router()

router.route('/ping')
  .post(
    findTokenBearer,
    authorize(User.Action.MonitoringPing),
    monitoringPing,
  )

export default router
