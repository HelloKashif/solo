import cfg from '../config/index.js'
import * as glob from 'glob'
import { pathToFileURL } from 'node:url'
import express from 'express'

const port = cfg.server.port

const server = express()

function makeExpressRoute(module, method, middlewares = []) {
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
async function loadApiRoutes() {
  const apiRoutes = glob.sync('api/**/*.js', { posix: true })
  apiRoutes.forEach(async i => {
    const mod = await import(pathToFileURL(i))

    let endpoint = i
      .replace('index.js', '')
      .replace('.js', '')
      .replaceAll('[', ':')
      .replaceAll(']', '')
      .replace(/\/$/, '') //Remove last trailing slash
    endpoint = `/${endpoint}` //TODO mac vs windows bug here , mac needs /api
    const methods = ['get', 'post', 'put', 'delete']
    methods.forEach(m => {
      if (mod[m]) {
        console.log(
          `[Server] Discovered API Route ${m.toUpperCase()} ${endpoint}`,
        )
        server[m](
          endpoint,
          makeExpressRoute(
            mod[m],
            m,
            (mod.middlewares && mod.middlewares[m]) || [],
          ),
        )
      }
    })
  })
}

loadApiRoutes()

server.start = function () {
  server.listen(port, err => {
    if (err) throw err
    console.log(`[Server] Listening on port ${port}...`)
  })
}

export default server
