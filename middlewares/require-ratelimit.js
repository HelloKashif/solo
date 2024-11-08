import cache from '../cache/index.js'
import soloCfg from '../config/index.js'
import { formatDistanceToNowStrict } from 'date-fns'

/*
  Eg usage
  ================

  const mw = require('solo/middlewares')

  const modules = {
    get: [
      mw.requireRatelimit({
        interval: '10 per day',
        namespace: 'create-internship',
      }),
      handler,
    ],
  }
*/

//Eg: of limit strings
//   10 per minute
//   1 per hour
//   1 per second
const parseLimitString = str => {
  if (typeof str !== 'string') {
    throw Error(`Invalid limitStr type: ${typeof str}`)
  }
  const items = str.toLowerCase().split(' per ')
  if (items.length > 2) {
    throw Error(`Invalid limit configuration: ${str}`)
  }
  const max = parseInt(items[0])
  const interval = items[1]
  let duration
  if (interval === 'second') {
    duration = 1000
  } else if (interval === 'minute') {
    duration = 60 * 1000
  } else if (interval === 'hour') {
    duration = 60 * 60 * 1000
  } else if (interval === 'day') {
    duration = 24 * 60 * 60 * 1000
  } else {
    throw Error(`Unknown interval in limit configuration: ${str} (${items[1]})`)
  }

  return { max, duration }
}

const defaultOpts = {
  //Required items
  interval: null, //eg: '5 per second'
  namespace: null, //eg: 'create-internship'

  //Optional items
  shouldDisable: (req, opts) => {
    //You can disable ratelimiting by returning
    //true here based on the req params
    //eg. if (req.user === 'special_user') return true
    return false
  },
  getKey: (req, opts) => {
    //if there is a session use that
    //as key else fallback to ip
    let requestorKey
    if (req.session?.user) {
      requestorKey = req.session.user.id
    } else {
      requestorKey = req.clientIp
    }
    return requestorKey
  },
  getErrorMessage: (req, opts, expiresAt) => {
    const nextTime = formatDistanceToNowStrict(expiresAt)
    return {
      message: `Too many requests for this action. Try again in ${nextTime}`,
    }
  },
}

export default function requireRatelimit(config = {}) {
  const opts = { ...defaultOpts, ...config }

  if (!opts.namespace) throw Error('Missing namespace in requireRatelimit')
  if (!opts.interval) throw Error('Missing namespace in requireRatelimit')

  const { max, duration } = parseLimitString(opts.interval)

  return async req => {
    if (soloCfg.ratelimiter.disabled) return

    if (opts.shouldDisable(req, opts)) return

    const requestorKey = `limits:${opts.namespace}:` + opts.getKey(req, opts)

    const result = await cache.getRaw(requestorKey)
    const now = Date.now()
    if (!result || result.expiresAt < now) {
      //First timer or bucket expired
      await cache.setRaw(requestorKey, null, 1, now + duration)
      return
    }

    cache.increment(requestorKey) //async

    if (result.valueInt >= max) {
      return {
        statusCode: 429,
        error: opts.getErrorMessage(req, opts, result.expiresAt),
      }
    }
  }
}
