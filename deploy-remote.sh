set -euo pipefail

REPO_DIR="${REPO_DIR:-/var/www/webrat-v2}"
WEB_DIR="$REPO_DIR/apps/web"
API_DIR="$REPO_DIR/apps/go-api"

DEPLOY_USER="${DEPLOY_USER:-deploy}"
DEPLOY_GROUP="${DEPLOY_GROUP:-deploy}"

as_deploy() {
  if [ "$(id -u)" -eq 0 ]; then
    sudo -u "$DEPLOY_USER" -H bash -lc "$*"
  else
    bash -lc "$*"
  fi
}

as_deploy "cd '$REPO_DIR' && git reset --hard && git pull"
as_deploy "cd '$REPO_DIR' && corepack enable"

install_deps() {
  as_deploy "cd '$REPO_DIR' && pnpm -w install"
}

if ! install_deps; then
  sudo rm -rf "$REPO_DIR/node_modules" "$WEB_DIR/node_modules"
  sudo chown -R "$DEPLOY_USER:$DEPLOY_GROUP" "$REPO_DIR"
  install_deps
fi

sudo rm -rf "$WEB_DIR/.next"
as_deploy "cd '$REPO_DIR' && pnpm --filter web build"

as_deploy "cd '$API_DIR' && go mod tidy && mkdir -p bin && go build -o ./bin/webcrystal-api ./cmd/server"

sudo systemctl restart webcrystal-web.service webcrystal-api.service
sudo systemctl status webcrystal-web.service webcrystal-api.service