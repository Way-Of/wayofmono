#!/usr/bin/env bash
pkill -f "next dev" 2>/dev/null && echo "Dev server stopped" || echo "No dev server running"
