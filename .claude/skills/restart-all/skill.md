# restart-all

Gracefully stop all dev servers and restart all AinexSuite apps.

## Instructions

Execute these commands in order:

### Step 1: Gracefully stop all servers

```bash
echo "Stopping all dev servers gracefully..."

# First pass: SIGTERM for graceful shutdown
for port in $(seq 3000 3020); do
  PID=$(lsof -ti:$port 2>/dev/null)
  if [ -n "$PID" ]; then
    kill -TERM $PID 2>/dev/null
  fi
done

# Wait for graceful shutdown
sleep 3

# Second pass: Force kill any remaining
for port in $(seq 3000 3020); do
  lsof -ti:$port 2>/dev/null | xargs kill -9 2>/dev/null || true
done

sleep 1
echo "All dev servers stopped."
```

### Step 2: Start all dev servers in background

```bash
cd /Users/dinohorn/ainex/ainexsuite && pnpm turbo run dev --concurrency=30
```

Run the turbo dev command in the background so the user can continue working.

## App Reference

| App      | Port | Purpose               |
| -------- | ---- | --------------------- |
| main     | 3000 | Central dashboard     |
| notes    | 3001 | Colorful notes        |
| journal  | 3002 | Mood/reflections      |
| todo     | 3003 | Task management       |
| health   | 3004 | Body metrics          |
| album    | 3005 | Memory curation       |
| habits   | 3006 | Personal development  |
| mosaic   | 3007 | Dashboard & clocks    |
| fit      | 3008 | Workout tracking      |
| projects | 3009 | Project management    |
| flow     | 3010 | Visual automation     |
| subs     | 3011 | Subscription tracking |
| docs     | 3012 | Rich documents        |
| tables   | 3013 | Spreadsheets          |
| calendar | 3014 | Scheduling            |
| admin    | 3020 | Admin dashboard       |
