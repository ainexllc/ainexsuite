---
description: Kill all ports 3000-3020 and restart main (3000) and admin (3011) servers
---

Kill all Node processes running on ports 3000-3020 and restart the main app on port 3000 and admin app on port 3011.

Steps:
1. Kill all processes on ports 3000-3020
2. Start main app on port 3000 in background
3. Start admin app on port 3011 in background
4. Wait for both servers to be ready
5. Confirm both servers are running

Execute these commands:

```bash
# Kill all ports 3000-3020
for port in {3000..3020}; do
  lsof -ti:$port | xargs kill 2>/dev/null || true
done

# Wait a moment for ports to be freed
sleep 1

# Start main app on port 3000
pnpm --filter @ainexsuite/main dev &

# Start admin app on port 3011
pnpm --filter admin dev &

# Wait for servers to start
sleep 3

# Check if servers are running
echo "Checking server status..."
lsof -i:3000 && echo "✅ Main app running on port 3000"
lsof -i:3011 && echo "✅ Admin app running on port 3011"
```

After completion, confirm:
- Main app: http://localhost:3000
- Admin app: http://localhost:3011
