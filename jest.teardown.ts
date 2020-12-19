import rimraf from 'rimraf'

export default async () => {
  rimraf.sync(process.env.SSH_KEYS_PATH)
}
