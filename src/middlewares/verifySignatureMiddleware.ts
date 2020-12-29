import assert from '@/utils/assert'
import createLogger from '@/utils/logger'
import env from '@/utils/env'
import fs from 'fs'
import httpSignature from 'http-signature'
import path from 'path'
import { ErrorId, UnauthorizedAPIError } from '@/types'
import { RequestHandler } from 'express'
import { RequestSignature } from 'http-signature'

export const verifySignatureLogger = createLogger('verifySignature')
const verify = (parsed: RequestSignature, pub: string): boolean => {
  try {
    return httpSignature.verify(parsed, pub)
  } catch (e) {
    return false
  }
}

export const verifySignature: RequestHandler = (request, response, next) => {
  try {
    const parsed = httpSignature.parse(request)
    assert(env.sshKeys.includes(parsed.keyId), new UnauthorizedAPIError(ErrorId.SignatureUnknown))
    const pubPath = path.join(env.sshKeysPath, `${ parsed.keyId }.pub`)
    assert(fs.existsSync(pubPath), new UnauthorizedAPIError(ErrorId.SignatureNotFound))
    const pub = fs.readFileSync(pubPath, 'ascii')
    const isVerified = verify(parsed, pub)
    assert(isVerified, new UnauthorizedAPIError(ErrorId.SignatureNotVerified))
    verifySignatureLogger.pass(`Request [Signature ${ parsed.keyId }] is verified`)
    next()
  } catch (e) {
    verifySignatureLogger.error(e)
    next(e)
  }
}
