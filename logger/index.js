//TODO: Overrides console.error to write to slack as well
// const slack = require('./slack')
// const { isDev } = require('../utils')

export const init = () => {
  return //TODO
  //const _consoleErr = console.error

  //console.error = function (err, context) {
  //  if (isPacketOrderWarning(err)) return

  //  const attachment = {
  //    fallback: "Can't display the stack trace...",
  //    pretext: '',
  //    color: '#990000',
  //    mrkdwn_in: ['pretext', 'text'],
  //  }

  //  // Have support for errors that are both strings and objects
  //  if (typeof err === 'string') {
  //    attachment.pretext += `*Err*: ${err}\n`
  //    attachment.fallback = err
  //  } else if (typeof err === 'object') {
  //    attachment.pretext += `*${err.name}*: ${err.message}\n`
  //    attachment.fallback = err.message

  //    const stackTrace = findStackTrace(err)

  //    if (stackTrace) {
  //      attachment.text = `\`\`\`${stackTrace}\`\`\``
  //    }
  //  }

  //  if (context) {
  //    //passing ctx overrides stacktrace attachment
  //    //as context is more useful for debugging
  //    attachment.text = `\`\`\`${JSON.stringify(context, null, 2)}\`\`\``
  //  }

  //  const slackMessageBody = {
  //    attachments: [attachment],
  //    username: 'CONSOLE.ERROR',
  //  }

  //  _consoleErr(err)

  //  if (isDev) {
  //    console.log('DEBUG LOG:')
  //    console.log(JSON.stringify(context, null, 2))
  //  } else {
  //    slack.send(process.env.SLACK_NOTIFICATIONS_CHANNEL, slackMessageBody)
  //  }
  //}

  //console.json = function (json) {
  //  console.log(JSON.stringify(json, null, 2))
  //}
}

//Hack pretty print
JSON.pretty = json => {
  return JSON.stringify(json, null, 2)
}
