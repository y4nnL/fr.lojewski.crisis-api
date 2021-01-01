import createLogger from '@/utils/logger'
import env from '@/utils/env'
import fs from 'fs'
import httpSignature from 'http-signature'
import path from 'path'
import { assert } from '@/utils/assert'
import { ErrorId, UnauthorizedAPIError } from '@/types'
import { Request, RequestHandler } from 'express'
import { RequestSignature } from 'http-signature'
import { Signature, SignatureDocument, SignatureModel } from '@/models/Signature'

export const verifySignatureLogger = createLogger('verifySignature')

const verifyParsedRequest = (parsed: RequestSignature, pub: string): boolean => {
  try {
    return httpSignature.verify(parsed, pub)
  } catch (e) {
    return false
  }
}

const parseRequest = (request: Request): RequestSignature | null => {
  try {
    return httpSignature.parse(request)
  } catch (e) {
    return null
  }
}

export const verifySignature: RequestHandler = async (request, response, next) => {
  try {
    const parsed = parseRequest(request)
    assert.ok(parsed, new UnauthorizedAPIError(ErrorId.SignatureMalformed))
    assert.ok(env.sshKeys.includes(parsed.keyId), new UnauthorizedAPIError(ErrorId.SignatureUnknown))
    const pubPath = path.join(env.sshKeysPath, `${ parsed.keyId }.pub`)
    assert.ok(fs.existsSync(pubPath), new UnauthorizedAPIError(ErrorId.SignatureNotFound))
    const pub = fs.readFileSync(pubPath, 'ascii')
    const isVerified = verifyParsedRequest(parsed, pub)
    assert.ok(isVerified, new UnauthorizedAPIError(ErrorId.SignatureNotVerified))
    const signatureDocument = await SignatureModel.findById(parsed.params.signature).exec()
    assert.isNull(signatureDocument, new UnauthorizedAPIError(ErrorId.SignatureAlreadyVerified))
    const signature: Signature = { _id: parsed.params.signature }
    await SignatureModel.create(signature as SignatureDocument)
    verifySignatureLogger.pass(`Request [Signature ${ parsed.keyId }] is verified`)
    next()
  } catch (e) {
    verifySignatureLogger.error(e)
    next(e)
  }
}
