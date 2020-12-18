import assert from 'assert'
import fs from 'fs'
import path from 'path'
import { RequestHandler } from 'express'

import createLogger from '@/utils/logger'
import env from '@/utils/env'
import { UnauthorizedAPIError } from '@/types'

const httpSignature = require('http-signature')
const verifySignatureLogger = createLogger('verifySignature')

export const verifySignature: RequestHandler = (request, response, next) => {
  try {
    const parsed = httpSignature.parse(request)
    assert.strictEqual(env.sshKeys.indexOf(parsed.keyId) >= 0, true)
    const pub = fs.readFileSync(path.join(env.sshKeysPath, `${ parsed.keyId }.pub`), 'ascii')
    const isVerified = httpSignature.verify(parsed, pub)
    assert.strictEqual(isVerified, true)
    verifySignatureLogger.info(`Request signature is verified (keyId:${ parsed.keyId })`)
    next()
  } catch (e) {
    verifySignatureLogger.error(e)
    next(new UnauthorizedAPIError())
  }
}
