export interface Env {
  readonly dbUri: string
  readonly debug: boolean
  readonly isDevelopment: boolean
  readonly isProduction: boolean
  readonly isTest: boolean
  readonly jwtSecret: string
  readonly mode: string
  readonly pathCert: string
  readonly pathCertCA: string
  readonly pathCertKey: string
  readonly serverPort: number
  readonly sshKeys: string[]
  readonly sshKeysPath: string
}
