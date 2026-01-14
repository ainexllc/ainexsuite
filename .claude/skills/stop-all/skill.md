# stop-all

Stop all AinexSuite dev servers with graceful shutdown.

## Instructions

Execute this command to gracefully stop all dev servers:

```bash
echo "Stopping all dev servers gracefully..."

# First pass: SIGTERM for graceful shutdown
for port in $(seq 3000 3020); do
  PID=$(lsof -ti:$port 2>/dev/null)
  if [ -n "$PID" ]; then
    kill -TERM $PID 2>/dev/null
    echo "  Sent SIGTERM to port $port"
  fi
done

# Wait for graceful shutdown
sleep 3

# Second pass: Force kill any remaining
REMAINING=0
for port in $(seq 3000 3020); do
  PID=$(lsof -ti:$port 2>/dev/null)
  if [ -n "$PID" ]; then
    kill -9 $PID 2>/dev/null
    echo "  Force killed port $port"
    REMAINING=$((REMAINING + 1))
  fi
done

if [ $REMAINING -eq 0 ]; then
  echo "All dev servers stopped gracefully."
else
  echo "All dev servers stopped ($REMAINING force killed)."
fi
```

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
