---
description: Restart a single app by name (e.g., /restart-app main)
---

Restart a single AinexSuite app by killing its port and restarting it.

## Usage

```
/restart-app <app-name>
```

Examples:

- `/restart-app main` - Restart the main app on port 3000
- `/restart-app notes` - Restart the notes app on port 3001

## App Port Reference

| App      | Port |
| -------- | ---- |
| main     | 3000 |
| notes    | 3001 |
| journal  | 3002 |
| todo     | 3003 |
| health   | 3004 |
| album    | 3005 |
| habits   | 3006 |
| mosaic   | 3007 |
| fit      | 3008 |
| projects | 3009 |
| flow     | 3010 |
| subs     | 3011 |
| docs     | 3012 |
| tables   | 3013 |
| calendar | 3014 |
| admin    | 3020 |

## Steps

1. Determine the port for the requested app
2. Kill any process on that port
3. Restart just that app with `pnpm --filter @ainexsuite/<app> dev`

## Execute

Based on the app name provided in `$ARGUMENTS`:

1. Look up the port from the table above
2. Run:

```bash
# Kill process on the app's port
lsof -ti:<PORT> 2>/dev/null | xargs kill -9 2>/dev/null || true
sleep 1
echo "Killed process on port <PORT>"
```

3. Start the app in background:

```bash
cd /Users/dinohorn/ainex/ainexsuite && pnpm --filter @ainexsuite/<app> dev &
echo "Started @ainexsuite/<app> on port <PORT>"
```
