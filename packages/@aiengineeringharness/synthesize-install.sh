#!/usr/bin/env bash
#
# Synthesis & Installation Script
# Synch all harnesses with latest changes
#

set -eo pipefail

# Colors
GREEN='\033[0;32m'
RED='\033[0;31m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_NAME="synthesize-install"
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"

echo -e "${BLUE}==========================================>${NC}"
echo -e "${GREEN}  Synthesis & Installation Script${NC}"
echo -e "${BLUE}==========================================>${NC}"
echo ""

# Check if AI harness is in path
if command -v ai-harness &> /dev/null; then
    echo -e "${GREEN}[OK]${NC} AI Harness found: $(command -v ai-harness)"
    echo ""
    echo "To synch all harnesses, run:"
    echo "  ai-harness --sync-docs --tool=all"
    echo ""
    echo "Or manually synch each harness:"
    for tool in pi opencode gemini antigravity codex claude wocoder; do
        echo "  ai-harness --sync-docs --tool=$tool"
    done
else
    echo -e "${RED}[WARN]${NC} AI Harness not found in PATH"
    echo ""
    echo "Manual installation required:"
    echo ""
    echo "For each harness, create:"
    echo "  [name]_skill-auto-update"
    echo "  [name]_skill-adapter"
    echo "  [name]_skill-creator"
    echo "  backlog_groomer"
    echo ""
    echo "Reference files:"
    echo "  ${SCRIPT_DIR}/templates/"
fi
echo ""
echo "=== Synch Script ==="
echo ""
echo "Run this command to synch all harnesses:"
echo "  ai-harness --sync-docs --tool=all"
echo ""
echo "Or individual:"
for tool in pi opencode gemini antigravity codex claude wocoder; do
  echo "  ai-harness --sync-docs --tool=$tool"
done
echo ""
echo "=== End Synch Script ==="
