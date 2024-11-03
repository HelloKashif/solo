import dotenv from 'dotenv'
import path from 'path'
import fs from 'fs'

const files = ['.env']
const searchDir = process.cwd()

let _initted = false

if (!_initted) {
  for (const f of files) {
    const file = path.resolve(searchDir, f)
    if (!fs.existsSync(file)) continue

    // console.log(`Loading env from ${f}`)
    const { error } = dotenv.config({ path: file })
    if (error) throw error
  }
  _initted = true
}

export default process.env
