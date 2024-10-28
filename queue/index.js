let _queueClient

async function init() {
  console.log(`Initting queue`)
  _queueClient = {
    pop(topic, id, opts) {
      console.log(`Queue: pull ${topic} -> ${id}`)
    },
    push(topic, id, data, opts) {
      console.log(`Queue: insert ${topic} -> ${id}`)
    },
    remove(topic, id) {
      console.log(`Queue: remove ${topic} -> ${id}`)
    },
  }
}

if (!_queueClient) init()

export default _queueClient
