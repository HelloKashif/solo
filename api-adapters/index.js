import utils from '../utils/index.js'

function makeCacheHeaders(ttl) {
  const result = {}
  if (typeof ttl === 'number') {
    result['Cache-Control'] = `max-age=${ttl}, public`
  }
  return result
}

const corsHandler = (res, ssr = false) => {
  res.setHeader('Access-Control-Allow-Origin', '*')
  res.setHeader('Access-Control-Allow-Methods', '*')
  res.setHeader('Access-Control-Allow-Headers', '*')

  if (ssr) {
    res.statusCode = 200
    res.end('OK')
    return {
      props: {},
    }
  } else {
    return res.status(200).json({ ok: true })
  }
}

const logErrors = (req, response) => {
  if (!isDev) return
  if (!response || !response.error) return
  let extraPayload = ''
  if (response.statusCode && response.statusCode > 399) {
    extraPayload = `\n  -> ${JSON.stringify(response, null, 2)}`
  }

  console.log(`${req.method} ${req.url}${extraPayload}`)
}

const processJob = (req, response) => {
  //If job object then update job
  if (req.job && req.job.onComplete) {
    req.job.onComplete(response)
  }
}
const setupHeaders = (response, res) => {
  //If middleware or handler returns a non null
  //object, this means it wants to end the request
  let headers = response.headers || {}
  headers = { ...headers, ...makeCacheHeaders(response.ttl) }
  Object.entries(headers).forEach(([k, v]) => {
    res.setHeader(k, v)
  })
}

export function nextApi(handler) {
  return async (req, res) => {
    const method = req.method.toLowerCase()

    if (['options', 'head'].includes(method)) return corsHandler(res, false)

    if (!handler[method]) {
      return res.status(405).end(`Method ${req.method} Not Allowed`)
    }

    const callbacks = []
    try {
      const handlers = handler[method]
      for (let h of handlers) {
        const response = await h(req, res)
        if (response) {
          if (response.callback) {
            callbacks.push(response.callback)
            if (Object.keys(response).length === 1) {
              //just callback, continue
              continue
            }
          }

          logErrors(req, response)
          setupHeaders(response, res)

          processJob(req, response)

          res.status(response.statusCode || 200)
          if (response.error) {
            if (!response.statusCode) res.status(400)
            return res.json({
              error: response.error,
              errorData: response.errorData || undefined,
            })
          }
          if (response.redirect) {
            const redirectCode = response.redirect.permanent ? 301 : 307
            return res.redirect(redirectCode, response.redirect.destination)
          }

          if (response.end) {
            return res.end(response.data)
          }

          if (response.data) {
            res.setHeader('Content-Type', 'application/json')
            return res.send(JSON.stringify(response.data || {}, null, 2))
          }
        }
      }
    } catch (err) {
      const errCtx = {
        url: req.url,
        headers: req.headers,
        ip: req.ip,
        host: req.host,
      }
      if (err.response) {
        errCtx.response = err.response.data
      }
      console.error(err, errCtx)
      let msg = `Some error occurred in our system. Please contact support@namegrab.io`
      //Custom errors are generally safe to be shown on the client
      if (err.isCustom) msg = err.message

      if (utils.isDev || req.url.startsWith('/api/admin')) {
        msg = err.message
      }
      return res.status(500).json({ error: msg })
    } finally {
      //run cleanup callbacks (in reverse)
      for (let i = callbacks.length - 1; i >= 0; i--) {
        await callbacks[i]()
      }
    }
  }
}
