#!/bin/bash
# AINexSuite - Restart All Apps with mprocs
# Run with: ./scripts/restart-all.sh

cd "$(dirname "$0")/.."

# Kill any processes on dev ports
echo "Killing processes on dev ports..."
for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010 3011 3012 3013 3014 3020; do
  lsof -ti:$port 2>/dev/null | xargs kill -9 2>/dev/null || true
done

# Wait for ports to be freed
sleep 1

# Get git branch
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

# Display status
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  AINexSuite Dev Server                              Branch: $BRANCH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  ✓ All ports cleared (3000-3020)"
echo ""
echo "  Starting mprocs..."
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Start mprocs
exec mprocs
