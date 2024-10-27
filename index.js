import fs from "fs";
import express from "express";
import * as glob from "glob";
// import next from "next";

import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url); // get the resolved path to the file
const __dirname = path.dirname(__filename); // get the name of the directory

const solo = {};
const server = express();

async function loadConfig() {
  const configPath = path.resolve(process.cwd(), "solo.config.js");
  if (!fs.existsSync(configPath)) {
    console.error("No solo.config.js file found in this dir.");
    process.exit(1);
  }

  const { default: config } = await import(configPath);
  solo.config = config;
}

function makeExpressRoute(module, method, middlewares = {}) {
  return async (req, res) => {
    try {
      req.query = req.params;
      const callStack = [...(middlewares[method] || []), module];

      for (const func of callStack) {
        const result = await func(req, res);
        if (result?.error) {
          res.status(result.statusCode || 400);
          return res.send({ error: result.error });
        }

        if (result?.data) {
          return res.send(result.data);
        }
      }
    } catch (err) {
      console.log(err);
      res.status(500).send(err.message);
    }
  };
}
async function loadApiRoutes() {
  const apiPath = path.resolve(process.cwd(), "api/");

  if (!fs.existsSync(apiPath)) {
    return;
  }

  glob.sync(apiPath + "/**/*.js").forEach(async (i) => {
    const m = await import(i);

    let endpoint = i
      .replace(apiPath, "")
      .replace("index.js", "")
      .replace(".js", "")
      .replaceAll("[", ":")
      .replaceAll("]", "");
    endpoint = `/api${endpoint}`;
    if (m.get) {
      console.log(`Registering GET: ${endpoint}`);
      server.get(endpoint, makeExpressRoute(m.get, "get", m.middlewares));
    }
  });
}

async function init() {
  await loadConfig();
  await loadApiRoutes();
  console.log(solo.config);

  const port = solo.config.server.port;
  server.listen(port, (err) => {
    if (err) {
      console.error(err);
      process.exit(0);
    }

    console.log(`Ready on port ${port} NODE_ENV=${process.env.NODE_ENV}`);
  });
}

init();
export default solo;
