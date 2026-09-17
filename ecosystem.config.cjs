const fs = require("fs");
const path = require("path");
const env = { NODE_ENV: "production", HOST: "127.0.0.1", PORT: "4321" };
try {
  const raw = fs.readFileSync(path.join(__dirname, ".env"), "utf8");
  for (const line of raw.split("\n")) {
    const m = line.match(/^\s*([A-Z_][A-Z0-9_]*)\s*=\s*(.*?)\s*$/);
    // 去掉值两侧成对引号（JWT_SECRET="..." 否则会把引号带进密钥导致比对失败）
    if (m && !line.trim().startsWith("#")) {
      env[m[1]] = m[2].replace(/^(['"])(.*)\1$/, "$2");
    }
  }
} catch (e) {}
module.exports = {
  apps: [
    {
      name: "blog",
      script: "dist/server/entry.mjs",
      cwd: "/root/sonnet-blog",
      instances: 1,
      exec_mode: "fork",
      env,
    },
  ],
};
