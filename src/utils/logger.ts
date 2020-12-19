import chalk from 'chalk'
import env from '@/utils/env'
import winston from 'winston'
import { APIError } from '@/types/error'
import { format, LeveledLogMethod, Logger } from 'winston'
import { FormatWrap } from 'logform'

declare module 'winston' {
  interface Logger {
    pass: LeveledLogMethod
  }
}

type Type =
    'ARRAY'
  | 'BOOLEAN'
  | 'CLASS'
  | 'DATE'
  | 'NULL'
  | 'NUMBER'
  | 'OBJECT'
  | 'REGEXP'
  | 'STRING'
  | 'SYMBOL'
  | 'UNDEFINED'

function typeOf(object: any): Type {
  const type = Object.prototype.toString.call(object).slice(8, -1).toUpperCase()
  const name = object?.constructor?.name?.toUpperCase()
  return name ? (type === name ? type : 'CLASS') : type
}

function level(level: string) {
  switch (level) {
    case 'debug':
      return chalk.cyan(level)
    case 'info':
      return chalk.yellow(level)
    case 'pass':
      return chalk.green(level)
    case 'warn':
      return chalk.rgb(206, 100, 0)
    case 'error':
      return chalk.red(level)
    default:
      return chalk.grey(level)
  }
}

const fixError: FormatWrap = format((info: any) => {
  if (info instanceof APIError) {
    const message = {
      message: info.message,
      name: info.name,
      statusCode: info.statusCode,
    }
    return Object.assign({ message }, info)
  }
  if (info.message instanceof APIError) {
    const error = info.message
    const message = {
      message: error.message,
      name: error.name,
      statusCode: error.statusCode,
    }
    Object.assign(info, { message })
  }
  return info
})

function stringify(message: any, whiteSpacesLength = 0, startWithNewline = true): string {
  const type = typeOf(message)
  return type in stringify ? stringify[type](message, whiteSpacesLength, startWithNewline) : chalk.white(message)
}

namespace stringify {
  
  export const BOOLEAN = (m: any) => chalk.rgb(204, 120, 50).bgBlack(m)
  export const CLASS = (m: any, wsl: number, nl: boolean) => stringify.OBJECT(m, wsl, nl)
  export const DATE = (m: any) => stringify.SYMBOL(m)
  export const NULL = (m: any) => stringify.BOOLEAN(m)
  export const NUMBER = (m: any) => chalk.rgb(104, 151, 187).bgBlack(m)
  export const REGEXP = (m: any) => stringify.NUMBER(m)
  export const STRING = (m: any) => chalk.rgb(106, 135, 89).bgBlack(m)
  export const SYMBOL = (m: any) => chalk.rgb(152, 118, 170).bgBlack(m)
  export const UNDEFINED = (m: any) => stringify.BOOLEAN(m)
  
  export const OBJECT = (m: any, wsl: number, nl: boolean) => {
    const c = typeOf(m) === 'CLASS' ? m.constructor.name : ''
    if (c === 'ObjectID') return `(ObjectId) { ${ m._id } }`
    const ws = wsl ? new Array(wsl).join(' ') + ' ' : ''
    const ws2 = new Array(wsl + 2).join(' ') + ' '
    const sb = [ `${ nl ? `\n${ ws }` : '' }${ c ? `(${ c }) ` : '' }{` ]
    Object.keys(m).forEach((key) =>
      sb.push(`${ ws2 }${ chalk.rgb(152, 118, 170).bgBlack(key) }: ${ stringify(m[key], wsl + 2, false) },`))
    sb.push(`${ ws }}`)
    return sb.join('\n')
  }
  
  export const ARRAY = (m: any, wsl: number, nl: boolean) => {
    const ws = wsl ? new Array(wsl).join(' ') + ' ' : ''
    const ws2 = new Array(wsl + 2).join(' ') + ' '
    const sb = [ `${ nl ? `\n${ ws }` : '' }[` ]
    m.forEach((v: any, i: number) =>
      sb.push(`${ ws2 }[${ i }] ${ stringify(v, wsl + 2, false) },`))
    sb.push(`${ ws }]`)
    return sb.join('\n')
  }
  
}

export default function (service: string): Logger {
  if (env.isProduction) {
    return winston.createLogger({
      level: 'info',
      levels: { error: 0, warn: 1, pass: 2, info: 3, debug: 4 },
      format: winston.format.combine(
        winston.format.timestamp(),
        winston.format.json(),
      ),
      defaultMeta: { service },
      transports: [
        new winston.transports.File({ dirname: 'logs', filename: 'logs/error.log', level: 'error' }),
        new winston.transports.File({ dirname: 'logs', filename: 'logs/combined.log' }),
      ],
    })
  } else {
    return winston.createLogger({
      level: 'debug',
      levels: { error: 0, warn: 1, pass: 2, info: 3, debug: 4 },
      format: winston.format.combine(
        fixError(),
        winston.format.printf((info) =>
          `${ new Date().toISOString() } [${ info.service }] ${ level(info.level) }: ${ stringify(info.message) }`),
      ),
      defaultMeta: { service },
      transports: [
        new winston.transports.Console(),
      ],
    })
  }
}
