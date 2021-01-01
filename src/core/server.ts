import bodyParser from 'body-parser'
import createLogger from '@/utils/logger'
import env from '@/utils/env'
import express from 'express'
import fs from 'fs'
import https from 'https'
import router from '@/core/router'
import * as middleware from '@/middlewares'

if (!fs.existsSync(env.pathCert) || !fs.existsSync(env.pathCertCA) || !fs.existsSync(env.pathCertKey)) {
  throw new Error('Unable to locate certificate files')
}

export const app = express()
export const serverLogger = createLogger('server')

const ca = fs.readFileSync(env.pathCertCA, 'ascii')
const cert = fs.readFileSync(env.pathCert, 'ascii')
const key = fs.readFileSync(env.pathCertKey, 'ascii')
const server = https.createServer({ cert, ca, key }, app)

app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true }))
app.use(middleware.log)
app.use(middleware.queue(middleware.verifySignature))
app.use('/api', router)
app.use(middleware.handleNotFound)
app.use(middleware.castError)
app.use(middleware.handleError)

export async function start(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    try {
      server.listen(env.serverPort, () => {
        serverLogger.pass(`Started on https://localhost:${ env.serverPort }/`)
        resolve(true)
      })
    } catch (e) {
      reject(e)
    }
  })
}

export async function stop(): Promise<boolean> {
  return new Promise((resolve, reject) => {
    server.close((error) => {
      if (error) {
        reject(error)
      } else {
        serverLogger.pass(`Stopped on https://localhost:${ env.serverPort }/`)
        resolve(true)
      }
    })
  })
}
