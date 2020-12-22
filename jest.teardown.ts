import rimraf from 'rimraf'

// TODO <low> find a way to auto import this into tsconfig
import './jest.config'

export default async () => {
  await global.mongo.stop()
  if (process.env.SSH_KEYS_PATH) {
    rimraf.sync(process.env.SSH_KEYS_PATH)
  }
}
