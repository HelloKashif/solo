let _mailerClient

async function init() {
  // console.log(`Initting mailer`)
  _mailerClient = {
    send(stuff) {
      //TODO
      console.log(`Mailer: sending email`)
      console.log(stuff)
    },
    queue(stuff) {
      console.log(`Mailer: queuing email`)
    },
  }
}

if (!_mailerClient) init()

export default _mailerClient
