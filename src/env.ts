export interface Env {
  dbUri: string
  debug: boolean
  isDevelopment: boolean
  isProduction: boolean
  jwtSecret: string
  mode: string
}

const env: Env = {
  dbUri: process.env.DB_URI,
  debug: process.env.DEBUG === 'true',
  isDevelopment: process.env.NODE_ENV === 'development',
  isProduction: process.env.NODE_ENV === 'production',
  jwtSecret: process.env.JWT_SECRET,
  mode: process.env.NODE_ENV,
}

export default env
