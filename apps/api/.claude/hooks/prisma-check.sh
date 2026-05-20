#!/usr/bin/env bash
set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

if [ ! -f "prisma/schema.prisma" ]; then
  exit 0
fi

echo "[prisma-check] Checking Prisma schema..."

if command -v pnpm >/dev/null 2>&1; then
  pnpm prisma format
  pnpm prisma validate
  pnpm prisma generate
else
  npx prisma format
  npx prisma validate
  npx prisma generate
fi

echo "[prisma-check] Done."
