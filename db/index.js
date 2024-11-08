import path from 'path'
import knex from 'knex'
import soloConfig from '../config/index.js'
import utils from '../utils/index.js'
const dbCfg = soloConfig.db

const knexConfig = {
  client: 'better-sqlite3',
  useNullAsDefault: true,
  connection: {
    filename: path.resolve(process.cwd(), dbCfg.sqlite.file),
  },
  migrations: {
    directory: path.resolve(process.cwd(), dbCfg.migrationsDir || 'migrations'),
  },
  seeds: {
    directory: path.resolve(process.cwd(), dbCfg.seedsDir || 'seeds'),
  },
  pool: {
    afterCreate: (conn, cb) => {
      conn.pragma('foreign_keys = ON')
      conn.pragma('journal_mode=wal')
      cb(null, conn)
    },
  },
}

let db

if (!db) {
  //Prevent hot reload to exhaust db connections
  if (soloConfig.isDev) {
    const _cached = global['knex-db-conn'] || knex(knexConfig)
    db = _cached
    global['knex-db-conn'] = _cached
  } else {
    db = knex(knexConfig)
  }

  if (dbCfg.autoMigrate) {
    const currVer = await db.migrate.currentVersion()
    console.log(`[DB] Running migrations.... (latest version = ${currVer})`)
    await db.migrate.latest()
  }
}

export default db
