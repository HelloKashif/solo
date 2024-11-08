import nodemailer from 'nodemailer'
import { render, registerTemplates } from './template-renderer.js'
import utils from '../utils/index.js'
import config from '../config/index.js'
import chokidar from 'chokidar'

let _mailerClient

if (!_mailerClient) {
  _mailerClient = nodemailer.createTransport({
    pool: true,
    maxMessages: Infinity,
    ...config.mailer.smtp,
  })

  registerTemplates()
  if (config.isDev) {
    chokidar.watch('emails/').on('all', (event, path) => {
      console.log('[Mailer] hot reloading email templates...')
      registerTemplates()
    })
  }
}

const makeMessageId = () => `${utils.randomUUID()}.${config.server.host}`

const send = async ({
  id,
  from = config.mailer.fromAddress,
  to,
  subject,
  text,
  html,
  template,
  vars = {},
}) => {
  const messageId = id || makeMessageId()
  vars.messageId = messageId

  if (!vars.logoUrl) {
    vars.logoUrl = `${config.server.host}/static/images/logo-full.png`
  }

  let htmlToSend = html
  if (!htmlToSend && template) {
    let templateFile = template
    if (!templateFile.endsWith('.hbs')) templateFile += `.hbs`
    if (!templateFile.startsWith('emails/')) {
      templateFile = `emails/${templateFile}`
    }
    htmlToSend = await render(templateFile, { subject, ...vars })
  }

  console.log(`[Mailer] Sending mail: from: ${from}, to: ${to}`)
  return _mailerClient.sendMail({
    from,
    to,
    subject,
    text,
    html: htmlToSend,
    messageId,
  })
}

export default {
  send,
}
