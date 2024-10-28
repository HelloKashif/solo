let _dbClient

async function init() {
  console.log(`Initting db`)
  _dbClient = {}
}

if (_dbClient) init()

export default _dbClient
