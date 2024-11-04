import withSession from './with-session.js'
import requireRecaptcha from './require-recaptcha.js'
import requireRatelimit from './require-ratelimit.js'
import requireUserSession from './require-user-session.js'

function requireCronToken() {
  return null
}

const mw = {
  requireCronToken,
  requireRecaptcha,
  requireRatelimit,
  requireUserSession,
  withSession,
}

export default mw
