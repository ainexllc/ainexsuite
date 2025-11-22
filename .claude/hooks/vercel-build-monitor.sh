#!/bin/bash
# Vercel Build Monitor Hook
# Monitors Vercel deployments and auto-fixes build failures on main branch

set -e

# Configuration
PROJECT_ID="prj_qWQuZ68lqYmfGA0hJJwygUtRW0s4"  # ainexsuite-main
TEAM_ID="team_lNWTMcQWMnIRjyREXHHLAcbr"
CHECK_INTERVAL=60  # Check every 60 seconds
MAX_RETRIES=3

# Color codes
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

log_info() {
  echo -e "${GREEN}[VERCEL MONITOR]${NC} $1"
}

log_error() {
  echo -e "${RED}[VERCEL ERROR]${NC} $1"
}

log_warn() {
  echo -e "${YELLOW}[VERCEL WARN]${NC} $1"
}

# Check latest deployment status
check_deployment_status() {
  local deployments=$(gh api repos/ainexllc/ainexsuite/deployments \
    --jq '.[] | select(.environment=="production") | {id, status, created_at}' \
    --limit 1 2>/dev/null || echo "")

  if [ -z "$deployments" ]; then
    log_warn "No production deployments found"
    return 1
  fi

  echo "$deployments"
}

# Get Vercel deployment logs
get_deployment_logs() {
  local deployment_url=$1

  log_info "Fetching logs for deployment: $deployment_url"

  # Using Vercel API to get build logs
  vercel inspect "$deployment_url" --logs 2>/dev/null || echo ""
}

# Auto-fix common build errors
auto_fix_build() {
  local error_type=$1

  case "$error_type" in
    "typescript-error")
      log_info "Detected TypeScript error - running type check..."
      npm run build 2>&1 | tee /tmp/build-error.log
      return 1
      ;;
    "dependency-error")
      log_info "Detected dependency error - reinstalling dependencies..."
      rm -rf node_modules pnpm-lock.yaml
      pnpm install
      npm run build
      return 1
      ;;
    "firebase-error")
      log_info "Detected Firebase error - deploying Firebase configs..."
      firebase deploy --only firestore:rules,firestore:indexes
      npm run build
      return 1
      ;;
    *)
      log_error "Unknown error type: $error_type"
      return 1
      ;;
  esac
}

# Monitor and alert on failures
monitor_builds() {
  log_info "Starting Vercel build monitor for ainexsuite-main"

  while true; do
    status=$(check_deployment_status)

    if [ $? -eq 0 ]; then
      if echo "$status" | grep -q "FAILED"; then
        log_error "Build failed detected!"
        # TODO: Send notification and attempt auto-fix
      elif echo "$status" | grep -q "READY"; then
        log_info "Latest build successful"
      fi
    fi

    sleep $CHECK_INTERVAL
  done
}

# Main entry point
main() {
  if [ "$1" == "start" ]; then
    monitor_builds
  elif [ "$1" == "check-now" ]; then
    check_deployment_status
  else
    echo "Vercel Build Monitor"
    echo "Usage: $0 {start|check-now}"
    exit 1
  fi
}

main "$@"
