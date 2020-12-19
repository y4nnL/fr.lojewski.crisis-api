import chalk from 'chalk'
import env from '@/utils/env'
import winston from 'winston'
import { APIError } from '@/types/error'
import { format, Logger } from 'winston'
import { FormatWrap } from 'logform'

function typeOf(object: any): string {
  let type = Object.prototype.toString.call(object).slice(8, -1).toLowerCase()
  const name = object?.constructor?.name?.toLowerCase()
  if (name) {
    return type === name ? type : 'class'
  } else {
    return type
  }
}

function getLevelColor(level: string) {
  switch (level) {
    case 'info':
      return chalk.yellow(level)
    case 'debug':
      return chalk.cyan(level)
    case 'error':
      return chalk.red(level)
    default:
      return chalk.grey(level)
  }
}

const fixError: FormatWrap = format((info) => {
  const data = <any>info
  if (data instanceof APIError) {
    const message = {
      message: data.message,
      name: data.name,
      statusCode: data.statusCode,
    }
    return Object.assign({ message }, data)
  }
  if (data.message instanceof APIError) {
    const error = data.message
    const message = {
      message: error.message,
      name: error.name,
      statusCode: error.statusCode,
    }
    Object.assign(data, { message })
  }
  return data
})

function stringifyMessage(message: any, whiteSpacesCount = 0, startWithNewLine = true): string {
  const type = typeOf(message)
  const whiteSpaces = whiteSpacesCount ? new Array(whiteSpacesCount).join(' ') + ' ' : ''
  const whiteSpacesPlus2 = new Array(whiteSpacesCount + 2).join(' ') + ' '
  if (type === 'string') {
    return chalk.rgb(106, 135, 89).bgBlack(message)
  } else if (type === 'number' || type === 'regexp') {
    return chalk.rgb(104, 151, 187).bgBlack(message)
  } else if (type === 'boolean' || type === 'null' || type === 'undefined') {
    return chalk.rgb(204, 120, 50).bgBlack(message)
  } else if (type === 'symbol' || type === 'date') {
    return chalk.rgb(152, 118, 170).bgBlack(message)
  } else if (type === 'object' || type === 'class') {
    let prefix = type === 'class' ? `(${ message.constructor.name }) ` : ''
    let stringBuilder: string[] = [ `${ startWithNewLine ? `\n${ whiteSpaces }` : '' }${ prefix }{` ]
    Object.keys(message).forEach((key) => {
      stringBuilder.push([
        `${ whiteSpacesPlus2 }${ chalk.rgb(152, 118, 170).bgBlack(key) }: `,
        `${ stringifyMessage(message[key], whiteSpacesCount + 2, false) },`,
      ].join(''))
    })
    stringBuilder.push(`${ whiteSpaces }}`)
    return stringBuilder.join('\n')
  } else if (type === 'array') {
    const stringBuilder: string[] = [ `${ startWithNewLine ? `\n${ whiteSpaces }` : '' }[` ]
    message.forEach((value: any, i: number) => {
      stringBuilder.push(
        `${ whiteSpacesPlus2 }[${ i }] ${ stringifyMessage(message[i], whiteSpacesCount + 2, false) },`)
    })
    stringBuilder.push(`${ whiteSpaces }]`)
    return stringBuilder.join('\n')
  } else {
    return chalk.white(message)
  }
}

export default function (service: string): Logger {
  if (env.isProduction) {
    return winston.createLogger({
      level: 'info',
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
      format: winston.format.combine(
        fixError(),
        winston.format.printf(info => {
          return [
            new Date().toISOString(),
            `[${ info.service }]`,
            `${ getLevelColor(info.level) }:`,
            stringifyMessage(info.message),
          ].join(' ')
        }),
      ),
      defaultMeta: { service },
      transports: [
        new winston.transports.Console(),
      ],
    })
  }
}
