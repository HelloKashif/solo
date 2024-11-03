export function isEmail(input) {
  if (!input) return false

  //ridiculously long emails are considered invalid
  if (input.length > 100) return false
  return String(input)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    )
}
export function isURL(input) {
  if (!input) return false

  let parsed = input.trim()
  return parsed.startsWith('http://') || parsed.startsWith('https://')
}
export function isNumber() {
  throw 'Unimplemented'
}
export function isText() {
  throw 'Unimplemented'
}
export function isArray() {
  throw 'Unimplemented'
}
export function isJSON() {
  throw 'Unimplemented'
}

export default {
  isEmail,
  isURL,
  isNumber,
  isText,
  isArray,
  isJSON,
}
