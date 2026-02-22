set -euo pipefail

TARGET="${1:-all}"

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

if [ "$TARGET" = "all" ] || [ "$TARGET" = "api" ]; then
  as_deploy "cd '$API_DIR' && go mod tidy && mkdir -p bin && go build -o ./bin/webcrystal-api.tmp ./cmd/server && mv -f ./bin/webcrystal-api.tmp ./bin/webcrystal-api"
fi

if [ "$TARGET" = "all" ] || [ "$TARGET" = "web" ]; then
  sudo systemctl stop webcrystal-web
fi
if [ "$TARGET" = "all" ] || [ "$TARGET" = "api" ]; then
  sudo systemctl stop webcrystal-api
fi

if [ "$TARGET" = "all" ] || [ "$TARGET" = "web" ]; then
  as_deploy "rm -rf '$WEB_DIR/.next'"
  as_deploy "cd '$REPO_DIR' && pnpm --filter web build"
fi

if [ "$TARGET" = "all" ] || [ "$TARGET" = "api" ]; then
  sudo systemctl start webcrystal-api
fi
if [ "$TARGET" = "all" ] || [ "$TARGET" = "web" ]; then
  sudo systemctl start webcrystal-web
fi

echo ""
echo "=== deploy ($TARGET) complete ==="
if [ "$TARGET" = "all" ] || [ "$TARGET" = "web" ]; then
  sudo systemctl status webcrystal-web --no-pager
fi
if [ "$TARGET" = "all" ] || [ "$TARGET" = "api" ]; then
  sudo systemctl status webcrystal-api --no-pager
fi
