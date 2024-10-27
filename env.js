const dotenv = require("dotenv");
const path = require("path");
const fs = require("fs");

const envFiles = [".env.local"];

const loadEnv = () => {
  for (const f of envFiles) {
    const file = path.resolve(__dirname, "..", f);
    if (fs.existsSync(file)) {
      console.log(`Loading env from ${f}`);
      const { error } = dotenv.config({ path: file });
      if (error) throw error;
    }
  }
};

module.exports = loadEnv;
