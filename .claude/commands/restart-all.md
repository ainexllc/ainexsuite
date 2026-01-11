---
description: Kill all ports 3000-3020 and prepare for mprocs restart
---

Restart all AinexSuite apps by clearing ports for mprocs.

## Steps

1. Kill any processes on dev ports (3000-3020)
2. Display status of freed ports
3. Instruct user to start mprocs

## Execute

```bash
# Kill any processes on dev ports
echo "Killing processes on dev ports..."
for port in 3000 3001 3002 3003 3004 3005 3006 3007 3008 3009 3010 3011 3012 3013 3014 3020; do
  lsof -ti:$port 2>/dev/null | xargs kill -9 2>/dev/null || true
done

# Wait for ports to be freed
sleep 1

# Get git branch
BRANCH=$(git -C /Users/dinohorn/ainex/ainexsuite branch --show-current 2>/dev/null || echo "unknown")

# Display status
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo "  AINexSuite Dev Server                              Branch: $BRANCH"
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
echo ""
echo "  ✓ All ports cleared (3000-3020)"
echo ""
echo "  To start all apps, run mprocs in your terminal:"
echo ""
echo "    cd /Users/dinohorn/ainex/ainexsuite && pnpm mprocs"
echo ""
echo "  Or if mprocs is already running, press 'r' to restart apps"
echo ""
echo "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━"
```

## mprocs Controls

Once mprocs is running:

| Key       | Action                |
| --------- | --------------------- |
| `j` / `k` | Navigate between apps |
| `r`       | Restart selected app  |
| `s`       | Start selected app    |
| `x`       | Stop selected app     |
| `?`       | Show help             |
| `q`       | Quit mprocs           |

## App Reference

| App      | Port | Color | Purpose               |
| -------- | ---- | ----- | --------------------- |
| main     | 3000 | 🟠    | Central dashboard     |
| notes    | 3001 | 🟡    | Colorful notes        |
| journal  | 3002 | 🟠    | Mood/reflections      |
| todo     | 3003 | 🟣    | Task management       |
| health   | 3004 | 🟢    | Body metrics          |
| album    | 3005 | 🩷    | Memory curation       |
| habits   | 3006 | 🩵    | Personal development  |
| mosaic   | 3007 | 🔴    | Dashboard & clocks    |
| fit      | 3008 | 🔵    | Workout tracking      |
| projects | 3009 | 🟣    | Project management    |
| flow     | 3010 | 🩵    | Visual automation     |
| subs     | 3011 | 🟢    | Subscription tracking |
| docs     | 3012 | 🔵    | Rich documents        |
| tables   | 3013 | 🟢    | Spreadsheets          |
| calendar | 3014 | 🩵    | Scheduling            |
| admin    | 3020 | ⚪    | Admin dashboard       |
