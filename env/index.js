import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

const DEFAULT_FILES = ['.env']
const DEFAULT_DIR = process.cwd()

export const init = (searchDir = DEFAULT_DIR, files = DEFAULT_FILES) => {
  for (const f of files) {
    const file = path.resolve(searchDir, f)
    if (!fs.existsSync(file)) continue

    // console.log(`Loading env from ${f}`)
    const { error } = dotenv.config({ path: file })
    if (error) throw error
  }
}

let _initted = false

if (!_initted) {
  init()
  _initted = true
}
