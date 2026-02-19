set -euo pipefail

REPO_DIR="${REPO_DIR:-/var/www/webrat-v2}"
WEB_DIR="$REPO_DIR/apps/web"
API_DIR="$REPO_DIR/apps/go-api"

as_deploy() {
  if [ "$(id -u)" -eq 0 ]; then
    sudo -u deploy -H bash -lc "$*"
  else
    bash -lc "$*"
  fi
}

as_deploy "cd '$REPO_DIR' && git fetch --all --prune && git reset --hard origin/main && git clean -fd"
as_deploy "cd '$REPO_DIR' && corepack enable"

as_deploy "cd '$REPO_DIR' && pnpm -w install"

as_deploy "rm -rf '$WEB_DIR/.next'"
as_deploy "cd '$REPO_DIR' && pnpm --filter web build"

as_deploy "cd '$API_DIR' && go mod tidy && mkdir -p bin && go build -o ./bin/webcrystal-api ./cmd/server"

echo "Configuring SMTP settings..."
sudo mkstemctl restart webcrystal-api
sudo systemctl status webcrystal-web
sudo systemctl status webcrystal-api
