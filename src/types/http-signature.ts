declare module 'http-signature' {
  
  import http from 'http'
  import { Request } from 'express'
  
  export type RequestSignature = {
    keyId: string
  }
  
  export type SignOptions = {
    key: string
    keyId: string
    keyPassphrase?: string
  }
  
  export function parse(request: http.ClientRequest | Request): RequestSignature
  export function sign(request: http.ClientRequest | Request, options: SignOptions): boolean
  export function verify(signature: RequestSignature, key: string): boolean
  
}

