import path from 'path'
import knex from 'knex'
import soloConfig from '../config/index.js'
import utils from '../utils/index.js'

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
  pool: {
    afterCreate: (conn, cb) => {
      conn.pragma('journal_mode=wal')
      cb(null, conn)
    },
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
    t.text('key').primary()
    t.integer('expiresAt')
    t.text('value')
    t.integer('valueInt') //Used for ratelimits
  })
}

const _cacheClient = {
  _db: db,
  async get(key, fetcher) {
    const result = await db('solo_cache').where({ key }).first()
    if (!result || result.expiresAt <= Date.now()) {
      const fResult = await fetcher(key)
      this.set(key, fResult.value, fResult.ttl)
      return fResult.value
    }

    return JSON.parse(result.value)
  },
  async getRaw(key) {
    const result = await db('solo_cache').where({ key }).first()
    return result
  },
  async setRaw(key, value, valueInt, expiresAt) {
    await db('solo_cache')
      .insert({ key, value, valueInt, expiresAt })
      .onConflict('key')
      .merge()
  },
  async set(key, value, ttl) {
    const expiresAt = Date.now() + utils.parseDuration(ttl, 'ms')
    await setRaw(key, JSON.stringify(value), null, expiresAt)
  },
  //Increments the valueInt by 1 or defined value
  async increment(key, valueInt = 1) {
    await db('solo_cache').where({ key }).increment('valueInt', valueInt)
  },
  async delete(key) {
    await db(solo_cache).where({ key }).del()
  },
}

await ensureInitted()

export default _cacheClient
