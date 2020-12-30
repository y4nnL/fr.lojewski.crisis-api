import env from '@/utils/env'
import fs from 'fs'
import httpSignature from 'http-signature'
import path from 'path'
import { exec } from 'child_process'
import { v4 as uuidV4 } from 'uuid'

export const sleep = async (time: number) =>
  await new Promise((resolve) => setTimeout(resolve, time * 1000))

export const getSignatureHeaders = async (): Promise<object> => {
  const id = uuidV4()
  const headers: any = {}
  const request: any = {
    getHeader: (h: any) => headers[h.toLowerCase()],
    setHeader: (h: any, v: any) => headers[h.toLowerCase()] = v,
  }
  const rsa = {
    key: path.join(env.sshKeysPath, id),
    pub: path.join(env.sshKeysPath, id + '.pub'),
  }
  try {
    await new Promise<void>((resolve, reject) =>
      exec(`ssh-keygen -t rsa -b 2048 -C "${ id }" -N "${ id }" -m PEM -f "${ rsa.key }"`, (e) => {
        if (e) return reject(e)
        rsa.key = fs.readFileSync(rsa.key, 'ascii')
        resolve()
      }))
    httpSignature.sign(request, { key: rsa.key, keyId: id, keyPassphrase: id })
    env.sshKeys.push(id)
  } catch (e) {
  }
  return headers
}

class MyClass {
  property = 'value'
}

type Type = {
  array: any[]
  boolean: true
  class: MyClass
  date: Date
  null: null
  number: number
  object: object
  regexp: RegExp
  string: string
  symbol: Symbol
  undefined: undefined
}

export const omitTypes = <K extends keyof Type>(omit?: K[]): Type => {
  const types: Type = {
    array: [ 'item' ],
    boolean: true,
    class: new MyClass(),
    date: new Date(),
    null: null,
    number: 42,
    object: { property: 'value' },
    regexp: /42/,
    string: 'string',
    symbol: Symbol(42),
    undefined: undefined,
  }
  if (omit) {
    omit.forEach((type) => delete types[type])
  }
  return types
}



