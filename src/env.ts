export interface Env {
  debug: boolean
  mode: string
  isProduction: boolean
  isDevelopment: boolean
  dbUri: string
}

const env: Env = {
  debug: process.env.DEBUG === 'true',
  mode: process.env.NODE_ENV,
  dbUri: process.env.DB_URI,
  isProduction: process.env.NODE_ENV === 'production',
  isDevelopment: process.env.NODE_ENV === 'development',
}

export default env
