import cfg from '../config/index.js'
import utils from '../utils/index.js'
import * as glob from 'glob'
import { pathToFileURL } from 'node:url'
import express from 'express'
import chokidar from 'chokidar'
import bodyParser from 'body-parser'
import requestIp from 'request-ip'
import * as esbuild from 'esbuild'

const port = cfg.server.port

const server = express()
server.use(requestIp.mw()) //makes req.clientIp available

function makeExpressHandler(module, middlewares = []) {
  return async (req, res) => {
    const callbacks = []
    try {
      req.query = req.params
      const callStack = [...middlewares, module]

      for (const func of callStack) {
        const result = await func(req, res)
        if (!result) continue

        if (result.callback) {
          callbacks.push(result.callback)
        }

        if (result.statusCode) {
          res.status(result.statusCode)
        }

        if (result.ttl && typeof result.ttl === 'number') {
          res.setHeader('Cache-Control', `max-age=${result.ttl}, public`)
        }

        if (result.headers) {
          Object.entries(result.headers).forEach(([k, v]) => {
            res.setHeader(k, v)
          })
        }
        if (result.end) {
          return res.end(result.data)
        }

        if (result.redirect) {
          const redirectCode = result.redirect.permanent ? 301 : 307
          return res.redirect(redirectCode, result.redirect.destination)
        }

        res.setHeader('Content-Type', 'application/json')
        if (result.error) {
          res.status(result.statusCode || 400)
          return res.send({ error: result.error })
        }

        if (result.data) {
          return res.send(JSON.stringify(result.data, null, 2))
        }
      }
    } catch (err) {
      console.log(err)
      res.status(500).send(err.message)
    } finally {
      //run cleanup callbacks (in reverse)
      for (let i = callbacks.length - 1; i >= 0; i--) {
        await callbacks[i]()
      }
    }
  }
}

let apiRouter

server.use('/api', bodyParser.json(), function (req, res, next) {
  apiRouter(req, res, next)
})

async function loadApiRoutes(importPrefix = '') {
  const newRouter = new express.Router()

  const apiRoutes = glob.sync('api/**/*.js', { posix: true })

  apiRoutes.forEach(async i => {
    const pp = pathToFileURL(importPrefix + i)

    //For Hot reload
    if (importPrefix) pp.hash = Date.now()

    const mod = await import(pp.href)

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
          makeExpressHandler(
            mod[m],
            (mod.middlewares && mod.middlewares[m]) || [],
          ),
        )
      }
    })
  })

  apiRouter = newRouter
}

if (utils.isDev) {
  const reloadApiRoutes = {
    name: 'reloadApiRoutes',
    setup(build) {
      build.onEnd(result => {
        if (result.errors.length) {
          console.log(`Error compiling API routes`)
          console.log(result.errors)
          return
        }
        loadApiRoutes('.solo/')
      })
    },
  }
  const ctx = await esbuild.context({
    entryPoints: ['api/**/*.js'],
    bundle: true,
    splitting: true,
    format: 'esm',
    outdir: `.solo/api`,
    platform: 'node',
    packages: 'external',
    plugins: [reloadApiRoutes],
  })
  await ctx.watch()
} else {
  loadApiRoutes()
}

server.start = function () {
  server.listen(port, err => {
    if (err) throw err
    console.log(`[Server] Listening on port ${port}...`)
  })
}

export default server
