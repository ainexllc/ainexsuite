# stop-app

Stop a specific AinexSuite app by name with graceful shutdown.

## Usage

```
/stop-app <appname>
```

## Instructions

1. Parse the app name from the user's input
2. Validate it exists in the app list below
3. Get the corresponding port
4. Gracefully stop the app (SIGTERM first, then SIGKILL if needed)

### Graceful stop command

```bash
APP_PORT=<port>
echo "Stopping app on port $APP_PORT..."

# First try graceful shutdown with SIGTERM
PID=$(lsof -ti:$APP_PORT 2>/dev/null)
if [ -n "$PID" ]; then
  kill -TERM $PID 2>/dev/null

  # Wait up to 5 seconds for graceful shutdown
  for i in 1 2 3 4 5; do
    if ! lsof -ti:$APP_PORT >/dev/null 2>&1; then
      echo "App stopped gracefully."
      exit 0
    fi
    sleep 1
  done

  # Force kill if still running
  lsof -ti:$APP_PORT 2>/dev/null | xargs kill -9 2>/dev/null || true
  echo "App force stopped."
else
  echo "No app running on port $APP_PORT."
fi
```

## App Reference

| App      | Port | Package Filter       |
| -------- | ---- | -------------------- |
| main     | 3000 | @ainexsuite/main     |
| notes    | 3001 | @ainexsuite/notes    |
| journal  | 3002 | @ainexsuite/journal  |
| todo     | 3003 | @ainexsuite/todo     |
| health   | 3004 | @ainexsuite/health   |
| album    | 3005 | @ainexsuite/album    |
| habits   | 3006 | @ainexsuite/habits   |
| mosaic   | 3007 | @ainexsuite/mosaic   |
| fit      | 3008 | @ainexsuite/fit      |
| projects | 3009 | @ainexsuite/projects |
| flow     | 3010 | @ainexsuite/flow     |
| subs     | 3011 | @ainexsuite/subs     |
| docs     | 3012 | @ainexsuite/docs     |
| tables   | 3013 | @ainexsuite/tables   |
| calendar | 3014 | @ainexsuite/calendar |
| admin    | 3020 | @ainexsuite/admin    |

## Validation

If the app name is not in the list above, inform the user:
"Unknown app: <appname>. Available apps: main, notes, journal, todo, health, album, habits, mosaic, fit, projects, flow, subs, docs, tables, calendar, admin"
