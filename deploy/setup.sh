#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ARCH="$(uname -m)"
[ "$ARCH" = "x86_64" ] && KARCH=amd64 || KARCH=arm64

echo "==> Docker"
command -v docker >/dev/null || { curl -fsSL https://get.docker.com | sh; sudo usermod -aG docker "$USER" || true; }

echo "==> kubectl"
command -v kubectl >/dev/null || {
  curl -fsSLo /tmp/kubectl "https://dl.k8s.io/release/$(curl -fsSL https://dl.k8s.io/release/stable.txt)/bin/linux/${KARCH}/kubectl"
  sudo install -m 0755 /tmp/kubectl /usr/local/bin/kubectl
}

echo "==> kind"
command -v kind >/dev/null || {
  curl -fsSLo /tmp/kind "https://kind.sigs.k8s.io/dl/v0.32.0/kind-linux-${KARCH}"
  sudo install -m 0755 /tmp/kind /usr/local/bin/kind
}

echo "==> uv"
command -v uv >/dev/null || curl -fsSL https://astral.sh/uv/install.sh | sh
export PATH="$HOME/.local/bin:$PATH"

echo "==> node 20"
command -v node >/dev/null || { curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -; sudo apt-get install -y nodejs; }

echo "==> caddy"
command -v caddy >/dev/null || {
  sudo apt-get install -y debian-keyring debian-archive-keyring apt-transport-https curl
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/gpg.key' | sudo gpg --dearmor -o /usr/share/keyrings/caddy-stable-archive-keyring.gpg
  curl -1sLf 'https://dl.cloudsmith.io/public/caddy/stable/debian.deb.txt' | sudo tee /etc/apt/sources.list.d/caddy-stable.list
  sudo apt-get update && sudo apt-get install -y caddy
}

echo "==> project dependencies"
( cd "$ROOT/backend" && uv sync )
( cd "$ROOT/frontend" && npm install )

echo "==> kind cluster + sandbox"
kind get clusters | grep -qx backstop || kind create cluster --name backstop
for ns in backstop-naive backstop-hardened; do
  kubectl create namespace "$ns" --dry-run=client -o yaml | kubectl apply -f -
  kubectl apply -n "$ns" -f "$ROOT/backend/k8s/app.yaml"
  kubectl -n "$ns" rollout status deploy/checkout --timeout=120s
  kubectl -n "$ns" rollout status deploy/prod-db --timeout=120s
done

echo "==> setup complete. Next: fill backend/.env, then run deploy/run.sh"
