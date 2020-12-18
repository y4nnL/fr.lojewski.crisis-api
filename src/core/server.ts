import bodyParser from 'body-parser'
import express from 'express'
import fs from 'fs'
import https from 'https'

import env from '@/utils/env'
import router from '@/core/router'
import * as middleware from '@/middlewares'

if (!fs.existsSync(env.pathCert) || !fs.existsSync(env.pathCertCA) || !fs.existsSync(env.pathCertKey)) {
  throw new Error('Unable to locate certificate files')
}

const app = express()
const ca = fs.readFileSync(env.pathCertCA, 'ascii')
const cert = fs.readFileSync(env.pathCert, 'ascii')
const key = fs.readFileSync(env.pathCertKey, 'ascii')
const server = https.createServer({ cert, ca, key }, app)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(middleware.log)
app.use(middleware.verifySignature)
app.use('/api', router)
app.use(middleware.handleNotFound)
app.use(middleware.castError)
app.use(middleware.handleError)

export default server
