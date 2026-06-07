# Deploying Backstop on a VPS

Hosts the full stack on one Ubuntu/Debian VPS with automatic HTTPS, so the
custom MCP server and guardrail server get stable public URLs (no tunnels) and
the dashboard is live.

## Layout

| Subdomain | Service | Port |
|---|---|---|
| `DOMAIN` | frontend (landing + `/run`) | 3033 |
| `api.DOMAIN` | run API (`/demo`, SSE) | 8033 |
| `guardrails.DOMAIN` | guardrail server (`/tfy/pii`, `/tfy/quality`) | 8133 |
| `mcp.DOMAIN` | custom Infra MCP (`/mcp`) | 8233 |

## 1. DNS

Point these A records at the VPS IP:

```
DOMAIN              -> <vps-ip>
api.DOMAIN          -> <vps-ip>
guardrails.DOMAIN   -> <vps-ip>
mcp.DOMAIN          -> <vps-ip>
```

## 2. Install + cluster

```bash
git clone <repo> backstop && cd backstop
bash deploy/setup.sh          # docker, kind, kubectl, uv, node, caddy, deps, cluster
```

(If Docker was just installed, log out/in once so your user is in the `docker` group.)

## 3. Configure

```bash
cp backend/.env.example backend/.env
# fill: TRUEFOUNDRY_BASE_URL, TRUEFOUNDRY_API_KEY, BACKSTOP_MODEL=prod-triage/prod-triage,
#       BACKSTOP_MCP_URL, BACKSTOP_LINEAR_TEAM, BACKSTOP_PROMPT_FQN, TFY_HOST,
#       BACKSTOP_LIVE=true, BACKSTOP_BACKEND=kind
```

## 4. Run

```bash
export DOMAIN=backstop.example.com
bash deploy/run.sh                                  # builds frontend, starts 4 services
DOMAIN=$DOMAIN caddy run --config deploy/Caddyfile  # HTTPS reverse proxy (or: caddy start)
```

## 5. Register in TrueFoundry

- **Guardrails** → add two custom guardrails:
  - input/mutate: `https://guardrails.DOMAIN/tfy/pii`
  - output/validate: `https://guardrails.DOMAIN/tfy/quality`
- **MCP Gateway** → add custom remote MCP server: `https://mcp.DOMAIN/mcp`

## Logs

`/tmp/bs-api.log`, `/tmp/bs-guard.log`, `/tmp/bs-mcp.log`, `/tmp/bs-fe.log`
