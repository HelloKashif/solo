import * as env from './env/index.js'
import config from './config/index.js'
import utils from './utils/index.js'
import db from './db/index.js'
import cache from './cache/index.js'
import queue from './queue/index.js'
import storage from './storage/index.js'
import mailer from './mailer/index.js'
import vault from './vault/index.js'
import validate from './validate/index.js'
import mw from './middlewares/index.js'
import { nextApi } from './api-adapters//index.js'
import server from './server/index.js'
import { init as loggerInit } from './logger/index.js'

function init() {
  loggerInit()
}

export {
  cache,
  db,
  storage,
  queue,
  mailer,
  utils,
  vault,
  validate,
  config,
  mw,
  nextApi,
  init,
  server,
}
