import rimraf from 'rimraf'

export default async () => {
  if (process.env.SSH_KEYS_PATH) {
    rimraf.sync(process.env.SSH_KEYS_PATH)
  }
}
