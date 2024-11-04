import cfg from '../config/index.js'
import utils from '../utils/index.js'
import { getIronSession } from 'iron-session'

const sessionOptions = {
  password: cfg.auth.session.secret,
  cookieName: cfg.auth.session.cookieName || 'solo_session',
}

function getPropertyDescriptorForReqSession(session) {
  return {
    enumerable: true,
    get() {
      return session
    },
    set(value) {
      const keys = Object.keys(value)
      const currentKeys = Object.keys(session)

      currentKeys.forEach(key => {
        if (!keys.includes(key)) {
          delete session[key]
        }
      })

      keys.forEach(key => {
        session[key] = value[key]
      })
    },
  }
}

export default async function withSession(req, res) {
  //allow access via 192.168... address as well
  if (utils.isDev) {
    sessionOptions.domain = req.hostname.split(':')[0]
    sessionOptions.secure = false
    sessionOptions.cookieOptions = {
      domain: req.hostname.split(':')[0],
      secure: false,
    }
  }

  const session = await getIronSession(req, res, sessionOptions)

  Object.defineProperty(
    req,
    'session',
    getPropertyDescriptorForReqSession(session),
  )
}
