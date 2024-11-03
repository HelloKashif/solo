import bcrypt from 'bcryptjs'
import jwt from 'jsonwebtoken'
import Cryptr from 'cryptr'

const _vault = {
  encodeJwt(payload, expiresIn = null, opts = {}) {
    if (expiresIn) opts.expiresIn = expiresIn
    return jwt.sign(payload, process.env.JWT_SIGN_SECRET, opts)
  },
  //Decodes a jwt payload OR returns null if not valid
  decodeJwt(payload) {
    let data
    try {
      data = jwt.verify(token, process.env.JWT_SIGN_SECRET)
    } catch (_) {}
    return data
  },

  //Encrypts given string
  encrypt(text) {
    const cryptr = new Cryptr(process.env.ENCRYPTION_SECRET)
    return cryptr.encrypt(text)
  },
  //Decrypts given encrypted string
  decrypt: encryptedText => {
    const cryptr = new Cryptr(process.env.ENCRYPTION_SECRET)
    return cryptr.decrypt(encryptedText)
  },

  hash(input, salt) {
    return bcrypt.hashSync(input, salt)
  },
  compareHash(input1, input2) {
    return bcrypt.compareSync(input1, input2)
  },
}

export default _vault
