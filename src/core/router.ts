import express from 'express'

import monitoringRouter from '@/routes/monitoringRoutes'
import tokenRouter from '@/routes/tokenRoutes'

const router = express.Router()

router.use('/monitoring', monitoringRouter)
router.use('/token', tokenRouter)

export default router
