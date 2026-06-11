#!/usr/bin/env bash
# WayOfMono CTO Dashboard - Cross-platform start script (macOS/Linux)
# Usage: ./start.sh [dev|prod]

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
UI_DIR="$SCRIPT_DIR/ui"
THOUGHTS_DIR="$SCRIPT_DIR/thoughts"

# Colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
CYAN='\033[0;36m'
NC='\033[0m' # No Color

log_info() { echo -e "${BLUE}[INFO]${NC} $*"; }
log_success() { echo -e "${GREEN}[SUCCESS]${NC} $*"; }
log_warn() { echo -e "${YELLOW}[WARN]${NC} $*"; }
log_error() { echo -e "${RED}[ERROR]${NC} $*"; }
log_step() { echo -e "${CYAN}[STEP]${NC} $*"; }

MODE="${1:-dev}"

check_command() {
  if ! command -v "$1" &> /dev/null; then
    log_error "$1 is not installed. Please install it first."
    return 1
  fi
  log_success "$1 found: $("$1" --version 2>/dev/null | head -1)"
  return 0
}

check_node_version() {
  local version
  version=$(node --version 2>/dev/null | sed 's/v//')
  local major
  major=$(echo "$version" | cut -d. -f1)
  if [ "$major" -lt 20 ]; then
    log_error "Node.js >= 20 required, found $version"
    return 1
  fi
  log_success "Node.js $version (>= 20)"
  return 0
}

check_pnpm_version() {
  local version
  version=$(pnpm --version 2>/dev/null)
  local major
  major=$(echo "$version" | cut -d. -f1)
  if [ "$major" -lt 9 ]; then
    log_error "pnpm >= 9 required, found $version"
    return 1
  fi
  log_success "pnpm $version (>= 9)"
  return 0
}

check_bun_version() {
  local version
  version=$(bun --version 2>/dev/null)
  log_success "bun $version"
  return 0
}

sync_forrad() {
  log_step "Syncing f-rr-d (thoughts)..."
  if [ -d "$THOUGHTS_DIR/.git" ]; then
    cd "$THOUGHTS_DIR"
    if git pull --ff-only 2>&1; then
      log_success "f-rr-d synced successfully"
    else
      log_warn "f-rr-d sync had issues (may be up to date or have conflicts)"
    fi
    cd "$SCRIPT_DIR"
  else
    log_warn "thoughts directory not found or not a git repo, skipping sync"
  fi
}

install_dependencies() {
  log_step "Installing dependencies..."
  cd "$UI_DIR"
  if [ -f "pnpm-lock.yaml" ]; then
    pnpm install --frozen-lockfile
  else
    pnpm install
  fi
  log_success "Dependencies installed"
  cd "$SCRIPT_DIR"
}

build_ui() {
  log_step "Building UI for production..."
  cd "$UI_DIR"
  pnpm run build
  log_success "UI built successfully"
  cd "$SCRIPT_DIR"
}

start_dev() {
  log_step "Starting development mode..."
  sync_forrad
  install_dependencies

  log_info "Starting Electron + Next.js dev servers..."
  log_info "Press Ctrl+C to stop all processes"
  cd "$UI_DIR"

  trap 'kill $(jobs -p) 2>/dev/null; exit 0' INT TERM

  pnpm run electron:dev &
  wait
}

start_prod() {
  log_step "Starting production mode..."
  sync_forrad
  install_dependencies
  build_ui

  log_info "Starting Electron with built UI..."
  cd "$UI_DIR"
  pnpm run electron:build
  cd "$SCRIPT_DIR"
}

main() {
  echo "╔══════════════════════════════════════════════════════════════╗"
  echo "║         WayOfMono CTO Dashboard - Start Script             ║"
  echo "║              macOS/Linux (bash)                            ║"
  echo "╚══════════════════════════════════════════════════════════════╝"
  echo

  log_step "Checking prerequisites..."
  check_command node || exit 1
  check_node_version || exit 1
  check_command pnpm || exit 1
  check_pnpm_version || exit 1
  check_command bun || exit 1
  check_bun_version || exit 1

  if [ ! -d "$UI_DIR" ]; then
    log_error "UI directory not found at $UI_DIR"
    exit 1
  fi

  case "$MODE" in
    dev|development)
      start_dev
      ;;
    prod|production|build)
      start_prod
      ;;
    *)
      log_error "Unknown mode: $MODE"
      echo "Usage: $0 [dev|prod]"
      exit 1
      ;;
  esac
}

main "$@"