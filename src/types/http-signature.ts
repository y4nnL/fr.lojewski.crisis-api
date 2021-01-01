declare module 'http-signature' {
  
  import { Request } from 'express'
  
  export type RequestSignature = {
    keyId: string
    params: {
      signature: string
    }
  }
  
  export type SignOptions = {
    key: string
    keyId: string
    keyPassphrase?: string
  }
  
  export function parse(request: Request): RequestSignature
  export function sign(request: Request, options: SignOptions): boolean
  export function verify(signature: RequestSignature, key: string): boolean
  
}

