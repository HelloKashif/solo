import path from 'path'
import fs from 'fs'
import { pathToFileURL } from 'node:url'

let _loadedConfig

export async function init() {
  const cwd = process.cwd()
  const configPath = path.resolve(cwd, 'solo.config.js')

  if (!fs.existsSync(configPath)) {
    console.error('')
    throw Error(`No solo.config.js file found in curr directory: ${cwd}`)
  }

  const { default: config } = await import(pathToFileURL(configPath))

  _loadedConfig = config
}

if (!_loadedConfig) await init()

export default _loadedConfig
