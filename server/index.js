import cfg from '../config/index.js'
import express from 'express'

const port = cfg.server.port

const server = express()

server.start = function () {
  server.listen(port, err => {
    if (err) throw err
    console.log(`Server ready on port ${port}`)
  })
}

export default server
