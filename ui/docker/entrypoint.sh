#!/bin/sh
set -e

echo "→ Applying database schema..."
npx prisma db push --skip-generate 2>&1 || echo "⚠ db push failed (non-fatal)"

echo "→ Starting server..."
exec node server.js
