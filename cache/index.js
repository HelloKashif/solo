let _cacheClient

async function init() {
  _cacheClient = {
    get(key, fetcher) {
      console.log(`Getting key ${key}`)
    },
    set(key, value, ttl) {
      console.log(`Setting key ${key}:${JSON.stringify(value)} ${ttl}`)
    },
    delete(key) {
      console.log(`Deleting key ${key}`)
    },
  }
}

if (!_cacheClient) init()

export default _cacheClient
