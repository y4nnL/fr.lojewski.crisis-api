import { Env } from '@/types'

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
