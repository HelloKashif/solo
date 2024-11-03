import cfg from '../config/index.js'
import utils from '../utils/index.js'
import * as glob from 'glob'
import { pathToFileURL } from 'node:url'
import express from 'express'
import chokidar from 'chokidar'
import bodyParser from 'body-parser'
import requestIp from 'request-ip'

const port = cfg.server.port

const server = express()
server.use(requestIp.mw()) //makes req.clientIp available

function makeExpressRoute(module, middlewares = []) {
  return async (req, res) => {
    try {
      req.query = req.params
      const callStack = [...middlewares, module]

      for (const func of callStack) {
        const result = await func(req, res)
        if (result?.error) {
          res.status(result.statusCode || 400)
          return res.send({ error: result.error })
        }

        if (result?.data) {
          return res.send(result.data)
        }
      }
    } catch (err) {
      console.log(err)
      res.status(500).send(err.message)
    }
  }
}

let apiRouter

server.use('/api', bodyParser.json(), function (req, res, next) {
  apiRouter(req, res, next)
})

async function loadApiRoutes() {
  const newRouter = new express.Router()

  const apiRoutes = glob.sync('api/**/*.js', { posix: true })
  apiRoutes.forEach(async i => {
    const mod = await import(pathToFileURL(i))

    let endpoint = i
      .replace('api', '') //Remove initial api if any
      .replace('index.js', '')
      .replace('.js', '')
      .replaceAll('[', ':')
      .replaceAll(']', '')
      .replace(/\/$/, '') //Remove last trailing slash

    // console.log(`Endpoint ${endpoint}`)
    const methods = ['get', 'post', 'put', 'del']
    methods.forEach(m => {
      if (mod[m]) {
        let expressMethodName = m
        if (m === 'del') expressMethodName = 'delete'
        console.log(
          `[Server] Discovered API Route ${m.toUpperCase()} ${endpoint}`,
        )
        newRouter[expressMethodName](
          endpoint,
          makeExpressRoute(
            mod[m],
            (mod.middlewares && mod.middlewares[m]) || [],
          ),
        )
      }
    })
  })

  apiRouter = newRouter
}

loadApiRoutes()
if (utils.isDev) {
  chokidar.watch('./api', { cwd: process.cwd() }).on('change', () => {
    console.log(`[HMR] Reloading API ...`)
    loadApiRoutes()
  })
}

server.start = function () {
  server.listen(port, err => {
    if (err) throw err
    console.log(`[Server] Listening on port ${port}...`)
  })
}

export default server
