import fs from 'fs'
import express from 'express'
import * as glob from 'glob'
import { pathToFileURL } from 'node:url'
import * as esbuild from 'esbuild'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import path from 'path'
import { fileURLToPath } from 'url'
import cache from './cache'

const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory

const solo = {
  cache,
}

const server = express()

async function loadConfig() {
  const configPath = path.resolve(process.cwd(), 'solo.config.js')
  if (!fs.existsSync(configPath)) {
    console.error('No solo.config.js file found in this dir.')
    process.exit(1)
  }

  const { default: config } = await import(pathToFileURL(configPath))

  solo.config = config
}

const template = `
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Solo App</title>
  </head>
  <body>
    <div id="root"><!--root-html--></div>
    <script type="module" src="client-entry.js"></script>
  </body>
</html>
`

function makePageRouteWithAutoBuild(globPath) {
  return async (req, res) => {
    try {
      //Compile pages

      console.log('Fetching ', globPath)
      const result = await esbuild.build({
        entryPoints: [globPath],
        // jsx: 'automatic',
        bundle: true,
        format: 'esm',
        outfile: `.solo/${globPath}`,
        // external: ['react'],
        loader: {
          '.js': 'jsx',
        },
        // overwrite: true,
      })
      console.log(result)

      const modPath = path.resolve(process.cwd(), '.solo', globPath)
      console.log(modPath)
      const m = await import(pathToFileURL(modPath))

      const { default: Comp, getServerSideProps } = m
      let props = {}
      if (getServerSideProps) {
        props = await getServerSideProps(req)
      }

      // const { pipe } = ReactDOMServer.renderToPipeableStream(
      //   <body>
      //     <div id='root'>
      //       <Comp {...props} />
      //     </div>
      //     {/* <script src="/client.js"></script> */}
      //   </body>,
      //   // { bootstrapScripts: ['/client.js'] },
      // )

      // render the component to its html
      // Since we are on the server using plain TS, and outside
      // of Vite, we are not using JSX here
      const appHtml = await ReactDOMServer.renderToString(
        React.createElement(Comp, {
          ...props,
          path: req.url,
        }),
      )

      // Inject the app-rendered HTML into the template.
      const html = template
        .replace(`<!--root-html-->`, appHtml)
        .replace(
          '</head>',
          `<script type="text/javascript">window._SOLO_PROPS_ = ${JSON.stringify(
            props,
          )}</script></head>`,
        )

      // Send the rendered HTML back.
      res.status(200).set({ 'Content-Type': 'text/html' }).end(html)

      // pipe(res)
    } catch (err) {
      console.log(err)
      res.status(500).send(err.message)
    }
  }
}
function makeExpressRoute(module, method, middlewares = {}) {
  return async (req, res) => {
    try {
      req.query = req.params
      const callStack = [...(middlewares[method] || []), module]

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
  glob.sync('api/**/*.js', { posix: true }).forEach(async i => {
    const m = await import(pathToFileURL(i))

    let endpoint = i
      .replace('index.js', '')
      .replace('.js', '')
      .replaceAll('[', ':')
      .replaceAll(']', '')
    endpoint = `/${endpoint}` //TODO mac vs windows bug here , mac needs /api
    if (m.get) {
      console.log(`Registering GET: ${endpoint}`)
      server.get(endpoint, makeExpressRoute(m.get, 'get', m.middlewares))
    }
  })
}
async function loadPageRoutes() {
  glob.sync('pages/**/*.js', { posix: true }).forEach(async i => {
    console.log('here', i)
    let endpoint = i
      .replace('pages/', '')
      .replace('index.js', '')
      .replace('.js', '')
      .replaceAll('[', ':')
      .replaceAll(']', '')
    endpoint = `/${endpoint}` //TODO mac vs windows bug here , mac needs /api
    console.log(`Registering page route: ${endpoint}`)

    server.get(endpoint, makePageRouteWithAutoBuild(i))
  })
}

async function init() {
  // server.use((req, _, next) => {
  //   console.log(`Request: ${req.url}`)
  //   next()
  // })

  //Setup config
  await loadConfig()

  //Setup database

  await loadApiRoutes()
  await loadPageRoutes()

  const port = solo.config.server.port
  server.listen(port, err => {
    if (err) {
      console.error(err)
      process.exit(0)
    }

    console.log(`Ready on port ${port} NODE_ENV=${process.env.NODE_ENV}`)
  })
}

// await init()

export default solo
