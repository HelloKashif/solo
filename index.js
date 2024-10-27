import fs from 'fs'
import express from 'express'
import * as glob from 'glob'
import { pathToFileURL } from 'node:url'
import * as esbuild from 'esbuild'
import React from 'react'
import ReactDOMServer from 'react-dom/server'
import path from 'path'
import { fileURLToPath } from 'url'

const __filename = fileURLToPath(import.meta.url) // get the resolved path to the file
const __dirname = path.dirname(__filename) // get the name of the directory

const solo = {}
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

function makePageRoute(module) {
  return async (req, res) => {
    try {
      const { default: Comp, getServerSideProps } = module
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
  //Compile pages

  const result = await esbuild.build({
    entryPoints: glob.sync('pages/**/*.js', { posix: true }),
    jsx: 'automatic',
    bundle: true,
    format: 'esm',
    outdir: '.solo/pages',
    assetNames: 'assets/[dir]',
    // external: ['react'],
    loader: {
      '.js': 'jsx',
    },
    // overwrite: true,
  })

  glob.sync('pages/**/*.js', { posix: true }).forEach(async i => {
    const modPath = path.resolve(process.cwd(), '.solo', i)
    console.log(`Importing module: ${modPath}`)
    const m = await import(pathToFileURL(modPath))

    let endpoint = i
      .replace('pages/', '')
      .replace('index.js', '')
      .replace('.js', '')
      .replaceAll('[', ':')
      .replaceAll(']', '')
    endpoint = `/${endpoint}` //TODO mac vs windows bug here , mac needs /api
    console.log(`Registering page route: ${endpoint}`)

    server.get(endpoint, makePageRoute(m))
  })
}

async function init() {
  await loadConfig()

  server.use((req, _, next) => {
    console.log(`Request: ${req.url}`)
    next()
  })

  await loadApiRoutes()
  await loadPageRoutes()

  server.use(express.static(path.resolve(process.cwd(), '.solo/dist/client')))

  const port = solo.config.server.port
  server.listen(port, err => {
    if (err) {
      console.error(err)
      process.exit(0)
    }

    console.log(`Ready on port ${port} NODE_ENV=${process.env.NODE_ENV}`)
  })
}

init()
export default solo
