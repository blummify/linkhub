#!/usr/bin/env sh
# Full local gate: lint, types, tests, and component test coverage for changed files.
set -eu

cd "$(dirname "$0")/.."

echo "→ ESLint"
npm run lint

echo "→ TypeScript"
npm run typecheck

echo "→ Vitest"
npm run test:run

echo "→ Component test coverage (changed files)"
node scripts/check-component-tests.mjs

echo ""
echo "✓ All checks passed"
