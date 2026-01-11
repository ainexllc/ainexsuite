#!/bin/bash
# AINexSuite - Restart All Apps
# Run with: ./scripts/restart-all.sh

cd "$(dirname "$0")/.."

# Stop and delete all PM2 processes
pm2 delete all 2>/dev/null || true

# Kill any remaining processes on dev ports
for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010 3011 3012 3013 3014 3020; do
  lsof -ti:$port 2>/dev/null | xargs kill -9 2>/dev/null || true
done

# Wait for ports to be freed
sleep 2

# Start all apps with PM2
pm2 start ecosystem.config.js

# Wait for apps to initialize
sleep 3

# Get git branch
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

# Display dev-friendly status
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  AINexSuite Dev Server                              Branch: $BRANCH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""

# Get PM2 data and format nicely
pm2 jlist 2>/dev/null | node -e "
const data = JSON.parse(require('fs').readFileSync('/dev/stdin', 'utf8'));

const portMap = {
  main: 3000, notes: 3001, journal: 3002, todo: 3003,
  health: 3004, album: 3005, habits: 3006, mosaic: 3007,
  fit: 3008, projects: 3009, flow: 3010, subs: 3011, docs: 3012, tables: 3013, calendar: 3014, admin: 3020
};

const colorMap = {
  main: '🟠', notes: '🟡', journal: '🟠', todo: '🟣',
  health: '🟢', album: '🩷', habits: '🩵', mosaic: '🔴',
  fit: '🔵', projects: '🟣', flow: '🩵', subs: '🟢', docs: '🔵', tables: '🟢', calendar: '🩵', admin: '⚪'
};

console.log('  App          Port   Memory   Restarts  Status   URL');
console.log('  ─────────────────────────────────────────────────────────────────');

data.sort((a, b) => (portMap[a.name] || 9999) - (portMap[b.name] || 9999));

data.forEach(app => {
  const name = app.name.padEnd(10);
  const port = (portMap[app.name] || '????').toString().padEnd(6);
  const mem = ((app.monit?.memory || 0) / 1024 / 1024).toFixed(0).padStart(3) + 'mb';
  const restarts = app.pm2_env?.restart_time?.toString().padStart(2) || '0';
  const status = app.pm2_env?.status === 'online' ? '✓ up   ' : '✗ down ';
  const icon = colorMap[app.name] || '⚪';
  const url = 'localhost:' + (portMap[app.name] || '????');

  console.log('  ' + icon + ' ' + name + ' ' + port + ' ' + mem.padStart(6) + '    ' + restarts + '        ' + status + ' ' + url);
});

console.log('');
console.log('  ─────────────────────────────────────────────────────────────────');
const totalMem = data.reduce((sum, app) => sum + (app.monit?.memory || 0), 0) / 1024 / 1024;
console.log('  Total: ' + data.length + ' apps | Memory: ' + totalMem.toFixed(0) + 'mb | All apps ' + (data.every(a => a.pm2_env?.status === 'online') ? '✓ healthy' : '⚠ issues'));
"

echo ""
echo "  Quick Commands:"
echo "  ───────────────"
echo "  pm2 logs <app>       View app logs      (e.g., pm2 logs notes)"
echo "  pm2 restart <app>    Restart single app (e.g., pm2 restart main)"
echo "  pm2 monit            Interactive dashboard"
echo "  pm2 logs --lines 50  Recent logs across all apps"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
