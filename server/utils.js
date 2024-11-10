export function makeExpressHandler(module, middlewares = []) {
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
      res.setHeader('Content-Type', 'application/json')
      res.status(500).send(err.message)
    } finally {
      //run cleanup callbacks (in reverse)
      for (let i = callbacks.length - 1; i >= 0; i--) {
        await callbacks[i]()
      }
    }
  }
}
