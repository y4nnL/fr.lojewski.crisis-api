declare module 'http-signature' {
  import http from 'http'
  import { Request } from 'express'
  export type RequestSignature = {
    keyId: string
  }
  export function parse(request: http.ClientRequest | Request): RequestSignature
  export function verify(signature: RequestSignature, key: string): boolean
}

