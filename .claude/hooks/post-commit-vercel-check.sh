#!/bin/bash
# Post-commit hook: Verify build succeeds before commit is finalized
# This prevents broken builds from being pushed to main

set -e

# Get current branch
BRANCH=$(git rev-parse --abbrev-ref HEAD)

# Only check on main branch
if [ "$BRANCH" != "main" ]; then
  exit 0
fi

echo "🔍 Running Vercel build check for main branch..."

# Run build
if ! npm run build > /tmp/vercel-build.log 2>&1; then
  echo "❌ Build failed! Vercel deployment will fail."
  echo ""
  echo "Build log (last 50 lines):"
  tail -50 /tmp/vercel-build.log
  exit 1
fi

echo "✅ Build passed! Safe to deploy."
exit 0
