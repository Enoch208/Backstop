const path = require("path");

const ROOT = path.resolve(__dirname, "..");
const HOME = process.env.HOME || "/root";
const BASE = process.env.PATH || "/usr/local/sbin:/usr/local/bin:/usr/sbin:/usr/bin:/sbin:/bin";
const PATH = `${HOME}/.local/bin:${BASE}`;

module.exports = {
  apps: [
    {
      name: "backstop-api",
      cwd: path.join(ROOT, "backend"),
      script: "uv",
      args: "run uvicorn backstop.api:app --host 127.0.0.1 --port 8033",
      interpreter: "none",
      env: { PATH },
    },
    {
      name: "backstop-guardrails",
      cwd: path.join(ROOT, "backend"),
      script: "uv",
      args: "run uvicorn backstop.guardrails.server:app --host 127.0.0.1 --port 8133",
      interpreter: "none",
      env: { PATH },
    },
    {
      name: "backstop-mcp",
      cwd: path.join(ROOT, "backend"),
      script: "uv",
      args: "run python -m backstop.infra_mcp",
      interpreter: "none",
      env: { PATH },
    },
    {
      name: "backstop-frontend",
      cwd: path.join(ROOT, "frontend"),
      script: "npm",
      args: "run start",
      interpreter: "none",
      env: { PATH },
    },
  ],
};
