import path from 'path'
import hbs from 'handlebars'
import * as glob from 'glob'
import fs from 'fs'
import config from '../config/index.js'
import iCss from 'inline-css'

let compiledTemplates = {}

export function registerTemplates(rootTemplatesDir = 'emails') {
  const emailTemplates = glob.sync(`${rootTemplatesDir}/**/*.hbs`, {
    posix: true,
  })
  emailTemplates.forEach(i => {
    const filePath = path.join(process.cwd(), i)
    const source = fs.readFileSync(filePath, 'utf-8').toString()

    if (filePath.includes('_partials')) {
      const name = filePath.split('/').pop().replace('.hbs', '')
      hbs.registerPartial(name, source)
    } else {
      compiledTemplates[i] = hbs.compile(source)
    }
  })
}

export const renderFromString = (templateStr, vars = {}) => {
  return hbs.compile(templateStr)(vars)
}

export async function render(template, vars = {}, inlineCss = true) {
  const t = compiledTemplates[template]
  if (!t) throw Error(`Email template not found: ${template}`)

  let result = t(vars)

  if (inlineCss) result = await iCss(result, { url: '/' })

  return result
}
