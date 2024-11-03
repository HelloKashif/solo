function isEmail(input) {
  if (!input) return false

  //ridiculously long emails are considered invalid
  if (input.length > 100) return false
  return String(input)
    .toLowerCase()
    .match(
      /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
    )
}
function isURL() {}
function isNumber() {}
function isText() {}
function isArray() {}
function isJSON() {}

export default {
  isEmail,
  isURL,
  isNumber,
  isText,
  isArray,
  isJSON,
}
