import assert from '@/utils/assert'
import { Env } from '@/types'

// We could use an array for this but we have to assert each key specifically to avoid strictNullChecks error
assert(process.env.DB_URI, new Error('DB_URI environment variable not found'))
assert(process.env.JWT_SECRET, new Error('JWT_SECRET environment variable not found'))
assert(process.env.NODE_ENV, new Error('NODE_ENV environment variable not found'))
assert(process.env.PATH_CERT, new Error('PATH_CERT environment variable not found'))
assert(process.env.PATH_CERT_CA, new Error('PATH_CERT_CA environment variable not found'))
assert(process.env.PATH_CERT_KEY, new Error('PATH_CERT_KEY environment variable not found'))
assert(process.env.SERVER_PORT, new Error('SERVER_PORT environment variable not found'))
assert(process.env.SSH_KEYS, new Error('SSH_KEYS environment variable not found'))
assert(process.env.SSH_KEYS_PATH, new Error('SSH_KEYS_PATH environment variable not found'))

const env: Env = {
  dbUri: process.env.DB_URI,
  debug: process.env.DEBUG === 'true',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  jwtSecret: process.env.JWT_SECRET,
  mode: process.env.NODE_ENV,
  pathCert: process.env.PATH_CERT,
  pathCertCA: process.env.PATH_CERT_CA,
  pathCertKey: process.env.PATH_CERT_KEY,
  serverPort: Number(process.env.SERVER_PORT),
  sshKeys: process.env.SSH_KEYS.split(';'),
  sshKeysPath: process.env.SSH_KEYS_PATH,
}

export default env
