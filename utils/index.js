export const isDev = process.env.NODE_ENV === 'development'
export const isProd = process.env.NODE_ENV === 'production'

export function sleep() {}
export function randomUUID() {}
export function randomId(length = 10) {}
export function randomCode(length, type = 'alphanumeric') {}
export function randomInt(min = 0, max = 999) {
  return Math.floor(min + Math.random() * (max - min + 1))
}
export function randomFromArray(array) {}
export function noop() {}
export function redact(text, redactPercent) {}
export function parseDuration(str) {}

export default {
  isDev,
  isProd,
  sleep,
  randomUUID,
  randomId,
  randomCode,
  randomFromArray,
  noop,
  parseDuration,
}

const isDev = process.env.APP_ENV === 'development'
const isProd = process.env.APP_ENV === 'production'
const isPreview = process.env.APP_ENV === 'preview'
const isTest = process.env.APP_ENV === 'test'
exports.isDev = isDev
exports.isProd = isProd
exports.isPreview = isPreview
exports.isTest = isTest

exports.sleep = ms => new Promise(r => setTimeout(r, ms))

let healthStatus = true
exports.setHealth = value => (healthStatus = value)
exports.getHealth = () => healthStatus

exports.hmsToSeconds = str => {
  if (!str) return null
  try {
    let p = str.split(':')
    let s = 0
    let m = 1

    while (p.length > 0) {
      s += m * parseInt(p.pop(), 10)
      m *= 60
    }

    return s
  } catch (er) {
    //This maybe an int
    return parseInt(str)
  }
}

//This is for returning from our api middlewares/handlers
exports.err = (msg = '', statusCode = 400) => {
  return {
    statusCode,
    error: msg,
  }
}

// Appends http protocol to a url string
exports.appendHttpProtocol = (url, secure = true) => {
  if (url.startsWith('http://') || url.startsWith('https://')) {
    return url
  } else {
    const proto = secure ? 'https://' : 'http://'
    return `${proto}${url}`
  }
}

// Truncates a string and puts ... if needed
exports.truncateStr = (source, size = 30) => {
  try {
    return source.length > size ? source.slice(0, size - 1) + '...' : source
  } catch (err) {
    console.warn('Err truncating:', source, err)
    return source
  }
}
exports.noop = () => {}

exports.isUrl = str => {
  if (!str) return false

  let parsed = str.trim()
  return parsed.startsWith('http://') || parsed.startsWith('https://')
}

exports.formatNumber = n => {
  const formatCount = Intl.NumberFormat('us-EN').format
  return formatCount(n)
}
