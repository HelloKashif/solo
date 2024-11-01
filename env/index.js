import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

const DEFAULT_FILES = ['.env']
const DEFAULT_DIR = process.cwd()

let _initted = false

export const init = (
  searchDir = DEFAULT_DIR,
  files = DEFAULT_FILES,
  forceInit = false,
) => {
  if (_initted && !forceInit) return
  for (const f of files) {
    const file = path.resolve(searchDir, f)
    if (!fs.existsSync(file)) continue

    // console.log(`Loading env from ${f}`)
    const { error } = dotenv.config({ path: file })
    if (error) throw error
  }
  _initted = true
}
