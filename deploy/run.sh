#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
: "${DOMAIN:?set DOMAIN, e.g. DOMAIN=backstop.example.com bash deploy/run.sh}"
export PATH="$HOME/.local/bin:$PATH"

echo "==> stopping any previous services"
pkill -f "uvicorn backstop.api" 2>/dev/null || true
pkill -f "uvicorn backstop.guardrails.server" 2>/dev/null || true
pkill -f "backstop.infra_mcp" 2>/dev/null || true
pkill -f "next start" 2>/dev/null || true

echo "==> backend API (:8080), guardrails (:8081), infra MCP (:8090)"
cd "$ROOT/backend"
nohup uv run uvicorn backstop.api:app --host 127.0.0.1 --port 8080 > /tmp/bs-api.log 2>&1 &
nohup uv run uvicorn backstop.guardrails.server:app --host 127.0.0.1 --port 8081 > /tmp/bs-guard.log 2>&1 &
nohup uv run python -m backstop.infra_mcp > /tmp/bs-mcp.log 2>&1 &

echo "==> building + starting frontend (:3000) with API at https://api.$DOMAIN"
cd "$ROOT/frontend"
NEXT_PUBLIC_API_URL="https://api.$DOMAIN" npm run build
nohup npx next start -p 3000 > /tmp/bs-fe.log 2>&1 &

echo "==> services up. Start Caddy:  DOMAIN=$DOMAIN caddy run --config $ROOT/deploy/Caddyfile"
echo "    register in TF:  https://guardrails.$DOMAIN/tfy/pii , /tfy/quality  and  https://mcp.$DOMAIN/mcp"
