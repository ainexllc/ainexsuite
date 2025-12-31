---
description: Kill all ports 3000-3020 and restart all apps (main, admin, journey, notes, todo, track, fit, grow, moments, projects, pulse, workflow)
---

Restart all AinexSuite apps using PM2 process manager.

## Steps

1. Stop all PM2 processes and kill any orphaned port processes
2. Start all apps fresh with PM2
3. Wait for apps to initialize
4. Display developer-friendly status dashboard

## Execute

```bash
# Stop and delete all PM2 processes
pm2 delete all 2>/dev/null || true

# Kill any remaining processes on dev ports
for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010 3014 3020; do
  lsof -ti:$port 2>/dev/null | xargs kill -9 2>/dev/null || true
done

# Wait for ports to be freed
sleep 2

# Start all apps with PM2
cd /Users/dinohorn/ainex/ainexsuite && pm2 start ecosystem.config.js

# Wait for apps to initialize
sleep 3

# Get git branch
BRANCH=$(git -C /Users/dinohorn/ainex/ainexsuite branch --show-current 2>/dev/null || echo "unknown")

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
  health: 3004, album: 3005, habits: 3006, display: 3007,
  fit: 3008, projects: 3009, workflow: 3010, calendar: 3014, admin: 3020
};

const colorMap = {
  main: '🟠', notes: '🟡', journal: '🟠', todo: '🟣',
  health: '🟢', album: '🩷', habits: '🩵', display: '🔴',
  fit: '🔵', projects: '🟣', workflow: '🩵', calendar: '🩵', admin: '⚪'
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
```

## Output Format

After running, you'll see a developer dashboard showing:
- All 13 apps with their ports and URLs
- Memory usage per app and total
- Restart count (high counts = unstable app)
- Health status (up/down)
- Current git branch
- Quick reference commands

## App Reference

| App | Port | Color | Purpose |
|-----|------|-------|---------|
| main | 3000 | 🟠 | Central dashboard |
| notes | 3001 | 🟡 | Colorful notes |
| journal | 3002 | 🟠 | Mood/reflections |
| todo | 3003 | 🟣 | Task management |
| health | 3004 | 🟢 | Body metrics |
| album | 3005 | 🩷 | Memory curation |
| habits | 3006 | 🩵 | Personal development |
| display | 3007 | 🔴 | Vitality tracking |
| fit | 3008 | 🔵 | Workout tracking |
| projects | 3009 | 🟣 | Project management |
| workflow | 3010 | 🩵 | Visual automation |
| calendar | 3014 | 🩵 | Scheduling |
| admin | 3020 | ⚪ | Admin dashboard |
