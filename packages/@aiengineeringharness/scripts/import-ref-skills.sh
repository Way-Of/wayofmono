#!/usr/bin/env bash
# Import Ref Skills/Agents - Unix wrapper
# Usage: ./import-ref-skills.sh [--gap-analysis|--skill=tdd|--agents]
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
HARNESS_DIR="$(cd "$SCRIPT_DIR/.." && pwd)"
cd "$HARNESS_DIR" || exit 1
deno run --allow-read --allow-write --allow-run --allow-env "$SCRIPT_DIR/import-ref-skills.ts" "$@"
