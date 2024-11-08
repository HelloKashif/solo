import config from '../config/index.js'
import * as uuid from 'uuid'
import shortId from 'short-uuid'
import crypto from 'crypto'
import parseDur from 'parse-duration'
import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Cryptr from 'cryptr'

function sleep(ms) {
  return new Promise(r => setTimeout(r, ms))
}

function randomUUID(removeHyphens = true) {
  let result = uuid.v4()
  if (removeHyphens) result = result.replace(/-/g, '')
  return result
}
function randomId(len = 0) {
  const id = shortId.generate()
  if (!len) return id
  return id.slice(0, len)
}

function randomCode(len = 5, type = 'numeric') {
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

function randomInt(min = 0, max = 999) {
  return Math.floor(min + Math.random() * (max - min + 1))
}
function randomFromArray(array) {
  return array[randomInt(0, array.length)]
}

function noop() {}

function redact(text, redactPercent) {
  throw 'Unimplemented'
}

// Truncates a string and puts ... if needed
function truncateStr(source, size = 30) {
  try {
    return source.length > size ? source.slice(0, size - 1) + '...' : source
  } catch (err) {
    console.warn('Err truncating:', source, err)
    return source
  }
}

//eg: parseDuration('7m') => 7minutes in ms
function parseDuration(str, format = 'ms') {
  return parseDur(str, format)
}

function apiErr(msg, code = 400) {
  return {
    statusCode: code,
    error: {
      message: msg,
    },
  }
}

function encodeJwt(payload, expiresIn = null, opts = {}) {
  if (expiresIn) opts.expiresIn = expiresIn
  return jwt.sign(payload, config.vault.jwtSecret, opts)
}

//Decodes a jwt payload OR returns null if not valid
function decodeJwt(payload) {
  let data
  try {
    data = jwt.verify(payload, config.vault.jwtSecret)
  } catch (err) {
    if (isDev) console.log(err)
  }
  return data
}

//Encrypts given string
function encrypt(text) {
  const cryptr = new Cryptr(config.vault.encryptionSecret)
  return cryptr.encrypt(text)
}

//Decrypts given encrypted string
function decrypt(encryptedText) {
  const cryptr = new Cryptr(config.vault.encryptionSecret)
  return cryptr.decrypt(encryptedText)
}

function generateHash(input, salt) {
  return bcrypt.hashSync(input, salt)
}
function compareHash(input1, input2) {
  return bcrypt.compareSync(input1, input2)
}
function getExtensionFromUrl(url) {
  if (!url) {
    throw new Error('Invalid url:', url)
  }
  // return url.split('.').pop()
  return url.split(/[#?]/)[0].split('.').pop().trim()
}

export default {
  sleep,

  //Random
  randomUUID,
  randomId,
  randomCode,
  randomFromArray,

  noop,
  parseDuration,
  truncateStr,
  apiErr,

  //Vault
  encodeJwt,
  decodeJwt,
  encrypt,
  decrypt,
  generateHash,
  compareHash,

  getExtensionFromUrl,
}
