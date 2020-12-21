import env from '@/utils/env'
import fs from 'fs'
import httpSignature from 'http-signature'
import path from 'path'
import * as mockHttp  from 'mock-http'
import { ErrorId, UnauthorizedAPIError } from '@/types'
import { exec } from 'child_process'
import { NextFunction, Request, Response } from 'express'
import { verifySignature } from '@/middlewares/verifySignatureMiddleware'

interface RSA {
  id: string
  key: string
  pub: string
  pwd: string
}

describe('verifySignature middleware', () => {
  
  let request: mockHttp.Request
  let mockedRequest: Request
  let next: NextFunction
  
  // Good RSA key-pair
  let rsa1: RSA = {
    id: 'rsa1',
    key: path.join(env.sshKeysPath, 'rsa1'),
    pub: path.join(env.sshKeysPath, 'rsa1.pub'),
    pwd: 'rsa1@test.com'
  }
  // Missing RSA pub
  let rsa2: RSA = {
    id: 'rsa2',
    key: path.join(env.sshKeysPath, 'rsa2'),
    pub: path.join(env.sshKeysPath, 'rsa2.pub'),
    pwd: 'rsa2@test.com'
  }
  // Malformed RSA pub
  let rsa3: RSA = {
    id: 'rsa3',
    key: path.join(env.sshKeysPath, 'rsa3'),
    pub: path.join(env.sshKeysPath, 'rsa3.pub'),
    pwd: 'rsa3@test.com'
  }
  
  beforeAll(async () => {
    await new Promise<void>((resolve, reject) =>
      exec(`ssh-keygen -t rsa -b 2048 -C "${ rsa1.pwd }" -N "${ rsa1.pwd }" -m PEM -f "${ rsa1.key }"`, (e) => {
        if (e) return reject(e)
        rsa1.key = fs.readFileSync(rsa1.key, 'ascii')
        resolve()
      }))
    await new Promise<void>((resolve, reject) =>
      exec(`ssh-keygen -t rsa -b 2048 -C "${ rsa2.pwd }" -N "${ rsa2.pwd }" -m PEM -f "${ rsa2.key }"`, (e) => {
        if (e) return reject(e)
        rsa2.key = fs.readFileSync(rsa2.key, 'ascii')
        fs.unlinkSync(rsa2.pub)
        resolve()
      }))
    await new Promise<void>((resolve, reject) =>
      exec(`ssh-keygen -t rsa -b 2048 -C "${ rsa3.pwd }" -N "${ rsa3.pwd }" -m PEM -f "${ rsa3.key }"`, (e) => {
        if (e) return reject(e)
        rsa3.key = fs.readFileSync(rsa3.key, 'ascii')
        fs.unlinkSync(rsa3.pub)
        fs.writeFileSync(rsa3.pub, 'malformed')
        resolve()
      }))
  })
  
  beforeEach(() => {
    env.sshKeys = []
    request = new mockHttp.Request({ url: '/' })
    mockedRequest = <Request><any>request
    next = <NextFunction>jest.fn()
  })
  
  it('should reject an unknown signature id', () => {
    httpSignature.sign(mockedRequest, { key: rsa1.key, keyId: rsa1.id, keyPassphrase: rsa1.pwd });
    verifySignature(mockedRequest, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(new UnauthorizedAPIError(ErrorId.SignatureUnknown))
  })
  
  it('should reject a not found signature pub', () => {
    env.sshKeys = [ rsa2.id ]
    httpSignature.sign(mockedRequest, { key: rsa2.key, keyId: rsa2.id, keyPassphrase: rsa2.pwd });
    verifySignature(mockedRequest, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(new UnauthorizedAPIError(ErrorId.SignatureNotFound))
  })
  
  it('should reject a wrong signature pub', () => {
    env.sshKeys = [ rsa1.id ]
    httpSignature.sign(mockedRequest, { key: rsa2.key, keyId: rsa1.id, keyPassphrase: rsa2.pwd });
    verifySignature(mockedRequest, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(new UnauthorizedAPIError(ErrorId.SignatureNotVerified))
  })
  
  it('should reject a malformed signature pub', () => {
    env.sshKeys = [ rsa3.id ]
    httpSignature.sign(mockedRequest, { key: rsa3.key, keyId: rsa3.id, keyPassphrase: rsa3.pwd });
    verifySignature(mockedRequest, <Response>{}, next)
    expect(next).toHaveBeenCalledWith(new UnauthorizedAPIError(ErrorId.SignatureNotVerified))
  })
  
  it('should accept the only one authorized signature', () => {
    env.sshKeys = [ rsa1.id ]
    httpSignature.sign(mockedRequest, { key: rsa1.key, keyId: rsa1.id, keyPassphrase: rsa1.pwd });
    verifySignature(mockedRequest, <Response>{}, next)
    expect(next).toHaveBeenCalledWith()
  })
  
  it('should accept an authorized signature', () => {
    env.sshKeys = [ rsa1.id, rsa2.id, rsa3.id ]
    httpSignature.sign(mockedRequest, { key: rsa1.key, keyId: rsa1.id, keyPassphrase: rsa1.pwd });
    verifySignature(mockedRequest, <Response>{}, next)
    expect(next).toHaveBeenCalledWith()
  })
  
})
