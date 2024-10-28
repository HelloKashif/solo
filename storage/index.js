let _storageClient

async function init() {
  console.log(`Initting storage`)
  _storageClient = {
    put(topic, id) {
      console.log(`Storage: pull ${topic} -> ${id}`)
    },
    get(topic, id, payload) {
      console.log(`Storage: insert ${topic} -> ${id}`)
    },
    getStream(topic, id, payload) {
      console.log(`Storage: insert ${topic} -> ${id}`)
    },
    list(topic, id, payload) {
      console.log(`Storage: insert ${topic} -> ${id}`)
    },
    delete(topic, id) {
      console.log(`Storage: remove ${topic} -> ${id}`)
    },
    deleteAllWithPrefix(topic, id) {
      console.log(`Storage: remove ${topic} -> ${id}`)
    },
    generateDownloadUrl(topic, id) {
      console.log(`Storage: remove ${topic} -> ${id}`)
    },
    generateUploadUrl(topic, id) {
      console.log(`Storage: remove ${topic} -> ${id}`)
    },
  }
}

if (!_storageClient) init()

export default _storageClient
