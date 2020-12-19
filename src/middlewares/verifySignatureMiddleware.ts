import assert from 'assert'
import createLogger from '@/utils/logger'
import env from '@/utils/env'
import fs from 'fs'
import httpSignature from 'http-signature'
import path from 'path'
import { RequestHandler } from 'express'
import { UnauthorizedAPIError } from '@/types/error'

const verifySignatureLogger = createLogger('verifySignature')

export const verifySignature: RequestHandler = (request, response, next) => {
  try {
    const parsed = httpSignature.parse(request)
    assert.strictEqual(env.sshKeys.indexOf(parsed.keyId) >= 0, true, 'Unknown keyId')
    const pub = fs.readFileSync(path.join(env.sshKeysPath, `${ parsed.keyId }.pub`), 'ascii')
    const isVerified = httpSignature.verify(parsed, pub)
    assert.strictEqual(isVerified, true, `Request [Signature ${ parsed.keyId }] is not verified`)
    verifySignatureLogger.info(`Request [Signature ${ parsed.keyId }] is verified `)
    next()
  } catch (e) {
    verifySignatureLogger.error(e)
    next(new UnauthorizedAPIError())
  }
}
