---
description: Kill all ports 3000-3020 and restart all apps (main, admin, journey, notes, todo, track, fit, grow, moments, projects, pulse, workflow)
---

Restart all AinexSuite apps using PM2 process manager.

App Port Assignments:
- 3000: main
- 3001: notes
- 3002: journey
- 3003: todo
- 3004: health
- 3005: moments
- 3006: grow
- 3007: pulse
- 3008: fit
- 3009: projects
- 3010: workflow
- 3014: calendar
- 3020: admin

Steps:
1. Kill all existing PM2 processes
2. Kill any remaining processes on ports 3000-3020
3. Start all apps with PM2 using ecosystem.config.js
4. Show status of all running apps

Execute these commands:

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

# Show status
pm2 status
```

After completion, access apps at:
- http://localhost:3000 (main)
- http://localhost:3001 (notes)
- http://localhost:3002 (journey)
- http://localhost:3003 (todo)
- http://localhost:3004 (health)
- http://localhost:3005 (moments)
- http://localhost:3006 (grow)
- http://localhost:3007 (pulse)
- http://localhost:3008 (fit)
- http://localhost:3009 (projects)
- http://localhost:3010 (workflow)
- http://localhost:3014 (calendar)
- http://localhost:3020 (admin)

Useful PM2 commands:
- `pm2 logs` - View all logs
- `pm2 logs <app>` - View specific app logs (e.g., `pm2 logs main`)
- `pm2 restart <app>` - Restart specific app
- `pm2 monit` - Interactive monitoring dashboard
