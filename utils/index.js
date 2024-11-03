import * as uuid from 'uuid'
import shortId from 'short-uuid'
import crypto from 'crypto'

export const isDev = process.env.NODE_ENV === 'development'
export const isProd = process.env.NODE_ENV === 'production'

export function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

export function randomUUID(removeHyphens = true) {
  let result = uuid.v4()
  if (removeHyphens) result = result.replace(/-/g, '')
  return result
}
export function randomId(len = 10) {
  const id = shortId.generate()
  return id.slice(0, len)
}

export function randomCode(len = 5, type = 'alphanumeric') {
  const chars = {
    numeric: '01234567890',
  }
  const characters = chars[type]
  if (!characters) {
    throw `Unsupported type in randomCode ${type}`
  }

  let code = ''
  for (let i = 0; i < len; i++) {
    code += characters.charAt(crypto.randomInt(0, characters.length))
  }
  return code
}

export function randomInt(min = 0, max = 999) {
  return Math.floor(min + Math.random() * (max - min + 1))
}
export function randomFromArray(array) {
  return array[randomInt(0, array.length)]
}

export function noop() {}
export function redact(text, redactPercent) {
  throw 'Unimplemented'
}
export function parseDuration(str) {
  throw 'Unimplemented'
}

// Truncates a string and puts ... if needed
export function truncateStr(source, size = 30) {
  try {
    return source.length > size ? source.slice(0, size - 1) + '...' : source
  } catch (err) {
    console.warn('Err truncating:', source, err)
    return source
  }
}

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
  truncateStr,
}
