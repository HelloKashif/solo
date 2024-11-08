import axios from 'axios'
import cfg from '../config/index.js'
import utils from '../utils/index.js'

const verifyRecaptcha = async captcha => {
  if (!captcha) return false

  const response = await axios({
    url: `https://www.google.com/recaptcha/api/siteverify?secret=${cfg.recaptcha.secret}&response=${captcha}`,
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded; charset=utf-8',
    },
    method: 'POST',
  })
  return response.data.success
}

export default async function requireRecaptcha(req) {
  if (cfg.recaptcha.disabled) return

  const { recaptchaToken } = req.body

  const result = await verifyRecaptcha(recaptchaToken)

  if (!result) {
    return {
      statusCode: 400,
      error: 'Invalid recaptcha token, please retry',
    }
  }
}
