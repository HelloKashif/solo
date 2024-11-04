import path from 'path'
import knex from 'knex'
import soloConfig from '../config/index.js'

const cfg = soloConfig.cache

const knexConfig = {
  client: 'better-sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: path.resolve(
      process.cwd(),
      cfg?.sqlite?.file || './data/cache.sqlite',
    ),
  },
}

let _initted = false
let db = knex(knexConfig)

async function ensureInitted() {
  if (_initted) return

  const exists = await db.schema.hasTable('solo_cache')
  if (exists) {
    _initted = true
    return
  }

  console.log(`[Cache] Initializing empty cache....`)
  await db.schema.createTable('solo_cache', function (t) {
    t.string('key').primary()
    t.integer('expiresAt')
    t.json('value')
  })
}

const _cacheClient = {
  async get(key, fetcher) {
    const result = await db('solo_cache').where({ key }).first()
    if (!result || result.expiresAt <= Date.now()) {
      const fResult = await fetcher(key)
      this.set(key, fResult.value, fResult.ttl)
      return fResult.value
    }

    return JSON.parse(result.value)
  },
  async set(key, value, ttl) {
    await db('solo_cache').insert({
      key,
      value: JSON.stringify(value),
      expiresAt: Date.now() + utils.parseDuration(ttl, 'ms'),
    })
  },
  async delete(key) {
    await db(solo_cache).where({ key }).del()
  },
}

await ensureInitted()

export default _cacheClient
