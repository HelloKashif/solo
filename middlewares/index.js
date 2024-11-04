import withSession from './with-session.js'
import requireRecaptcha from './require-recaptcha.js'

function requireCronToken() {
  return null
}

const mw = {
  requireCronToken,
  requireRecaptcha,
  withSession,
}

export default mw
