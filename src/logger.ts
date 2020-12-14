import winston, { Logger } from 'winston'
import chalk from 'chalk'

function typeOf(object: any): string {
  let type = Object.prototype.toString.call(object).slice(8, -1).toLowerCase()
  const name = object?.constructor?.name?.toLowerCase()
  if (name) {
    return type === name ? type : 'class'
  } else {
    return type
  }
}

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
    for (let key in message) {
      if (message.hasOwnProperty(key)) {
        return [
          `${ startWithNewLine ? `\n${ whiteSpaces }` : '' }${ prefix }{\n`,
          `${ whiteSpacesPlus2 }${ chalk.rgb(152, 118, 170).bgBlack(key) }: `,
          `${ stringifyMessage(message[key], whiteSpacesCount + 2, false) },\n`,
          `${ whiteSpaces }}`
        ].join('')
      }
    }
  } else if (type === 'array') {
    const stringBuilder = [`\n${ whiteSpaces }[`]
    for (let i = 0, l = message.length; i < l; i++) {
      stringBuilder.push(`${ whiteSpacesPlus2 }[${i}] ${ stringifyMessage(message[i], whiteSpacesCount + 2, false) },`)
    }
    stringBuilder.push(`${ whiteSpaces }]`)
    return stringBuilder.join('\n')
  } else {
    return chalk.white(message)
  }
}

export default function (service: string): Logger {
  if (process.env.NODE_ENV === 'production') {
    return winston.createLogger({
      level: 'info',
      format: winston.format.json(),
      defaultMeta: { service },
      transports: [
        new winston.transports.File({ filename: 'error.log', level: 'error' }),
        new winston.transports.File({ filename: 'combined.log' }),
      ],
    })
  } else {
    return winston.createLogger({
      level: 'debug',
      format: winston.format.printf(debug => {
        return [
          new Date().toISOString(),
          `[${ debug.service }]`,
          `${ chalk.yellow(debug.level) }:`,
          stringifyMessage(debug.message),
        ].join(' ')
      }),
      defaultMeta: { service },
      transports: [
        new winston.transports.Console(),
      ],
    })
  }
}
