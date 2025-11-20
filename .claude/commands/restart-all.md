---
description: Kill all ports 3000-3020 and restart all apps (main, admin, journey, notes, todo, track, fit, grow, moments, projects, pulse, workflow)
---

Kill all Node processes running on ports 3000-3020 and restart all 12 AinexSuite apps.

App Port Assignments:
- 3000: main
- 3001: admin
- 3002: journey
- 3003: notes
- 3004: todo
- 3005: track
- 3006: fit
- 3007: grow
- 3008: moments
- 3009: projects
- 3010: pulse
- 3011: workflow

Steps:
1. Kill all processes on ports 3000-3020
2. Start all 12 apps in background with assigned ports
3. Wait for all servers to be ready
4. Confirm all servers are running

Execute these commands:

```bash
# Kill all ports 3000-3020
for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010 3011 3012 3013 3014 3015 3016 3017 3018 3019 3020; do
  lsof -ti:$port 2>/dev/null | xargs kill -9 2>/dev/null || true
done

# Wait for ports to be freed
sleep 2

# Start all apps in background
pnpm --filter @ainexsuite/main dev &
PORT=3001 pnpm --filter @ainexsuite/admin dev &
PORT=3002 pnpm --filter @ainexsuite/journey dev &
PORT=3003 pnpm --filter @ainexsuite/notes dev &
PORT=3004 pnpm --filter @ainexsuite/todo dev &
PORT=3005 pnpm --filter @ainexsuite/track dev &
PORT=3006 pnpm --filter @ainexsuite/fit dev &
PORT=3007 pnpm --filter @ainexsuite/grow dev &
PORT=3008 pnpm --filter @ainexsuite/moments dev &
PORT=3009 pnpm --filter @ainexsuite/projects dev &
PORT=3010 pnpm --filter @ainexsuite/pulse dev &
PORT=3011 pnpm --filter @ainexsuite/workflow dev &

# Wait for servers to start
sleep 5

# Check if servers are running
echo "Checking server status..."
for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010 3011; do
  if lsof -i:$port 2>/dev/null | grep -q LISTEN; then
    echo "✅ App running on port $port"
  else
    echo "❌ App not ready on port $port"
  fi
done
```

After completion, access apps at:
- http://localhost:3000 (main)
- http://localhost:3001 (admin)
- http://localhost:3002 (journey)
- http://localhost:3003 (notes)
- http://localhost:3004 (todo)
- http://localhost:3005 (track)
- http://localhost:3006 (fit)
- http://localhost:3007 (grow)
- http://localhost:3008 (moments)
- http://localhost:3009 (projects)
- http://localhost:3010 (pulse)
- http://localhost:3011 (workflow)
