#!/usr/bin/env bash
set -euo pipefail

cd "${CLAUDE_PROJECT_DIR:-$(pwd)}"

echo "[quality-check] Running minimal project checks..."

if [ -f "package.json" ]; then
  if command -v pnpm >/dev/null 2>&1; then
    pnpm lint 2>/dev/null || true
    pnpm typecheck 2>/dev/null || true

    if grep -q "vitest" package.json; then
      pnpm exec vitest run --passWithNoTests 2>/dev/null || true
    fi
  else
    npm run lint 2>/dev/null || true
    npm run typecheck 2>/dev/null || true
  fi
fi

if [ -f "prisma/schema.prisma" ]; then
  if command -v pnpm >/dev/null 2>&1; then
    pnpm prisma validate 2>/dev/null || true
  else
    npx prisma validate 2>/dev/null || true
  fi
fi

if [ -f "pubspec.yaml" ]; then
  if command -v dart >/dev/null 2>&1; then
    dart format . 2>/dev/null || true
  fi

  if command -v flutter >/dev/null 2>&1; then
    flutter analyze 2>/dev/null || true
  elif command -v dart >/dev/null 2>&1; then
    dart analyze 2>/dev/null || true
  fi
fi

echo "[quality-check] Done."
