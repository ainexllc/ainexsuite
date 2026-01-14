# health-check

Quick status dashboard showing all AinexSuite apps and packages health.

## Instructions

When the user runs `/health-check`, gather health information from multiple sources and display a comprehensive dashboard. Run these checks in parallel where possible for speed.

### Step 1: Check Running Dev Servers

```bash
echo "=== DEV SERVERS ===" && \
lsof -i :3000-3020 -P -n 2>/dev/null | grep LISTEN | awk '{print $9}' | sed 's/.*://' | sort -n | uniq
```

Map the ports to app names using the reference table below.

### Step 2: Check Turbo Build Cache

```bash
cd /Users/dinohorn/ainex/ainexsuite && turbo run build --dry-run=json 2>/dev/null | head -100
```

Parse the JSON output to identify cache hits (FULL TURBO) vs misses.

### Step 3: Check Vercel Deployment Status

Run these commands for all 16 apps (can run in parallel batches):

```bash
vercel ls ainexsuite-main --limit 1 2>/dev/null | tail -1
vercel ls ainexsuite-notes --limit 1 2>/dev/null | tail -1
vercel ls ainexsuite-journal --limit 1 2>/dev/null | tail -1
vercel ls ainexsuite-todo --limit 1 2>/dev/null | tail -1
vercel ls ainexsuite-health --limit 1 2>/dev/null | tail -1
vercel ls ainexsuite-album --limit 1 2>/dev/null | tail -1
vercel ls ainexsuite-habits --limit 1 2>/dev/null | tail -1
vercel ls ainexsuite-mosaic --limit 1 2>/dev/null | tail -1
vercel ls ainexsuite-fit --limit 1 2>/dev/null | tail -1
vercel ls ainexsuite-projects --limit 1 2>/dev/null | tail -1
vercel ls ainexsuite-flow --limit 1 2>/dev/null | tail -1
vercel ls ainexsuite-subs --limit 1 2>/dev/null | tail -1
vercel ls ainexsuite-docs --limit 1 2>/dev/null | tail -1
vercel ls ainexsuite-tables --limit 1 2>/dev/null | tail -1
vercel ls ainexsuite-calendar --limit 1 2>/dev/null | tail -1
vercel ls ainexsuite-admin --limit 1 2>/dev/null | tail -1
```

### Step 4: Check Outdated Dependencies

```bash
cd /Users/dinohorn/ainex/ainexsuite && pnpm outdated 2>/dev/null | wc -l
```

For detailed view:

```bash
cd /Users/dinohorn/ainex/ainexsuite && pnpm outdated 2>/dev/null | head -30
```

### Step 5: Check Test Status (if tests exist)

```bash
cd /Users/dinohorn/ainex/ainexsuite && pnpm test --passWithNoTests 2>/dev/null || echo "No tests configured"
```

## Output Format

Present the results as a clean dashboard:

```
================================================================================
                        AINEXSUITE HEALTH DASHBOARD
================================================================================

DEV SERVERS (Running)
--------------------------------------------------------------------------------
| App      | Port | Status  |
|----------|------|---------|
| main     | 3000 | Running |
| notes    | 3001 | Stopped |
| journal  | 3002 | Running |
| ...      | ...  | ...     |

Running: X/16 apps

VERCEL DEPLOYMENTS
--------------------------------------------------------------------------------
| App      | Status | Age     | URL                          |
|----------|--------|---------|------------------------------|
| main     | Ready  | 2h ago  | ainexsuite-main-xxx.vercel.app |
| notes    | Ready  | 1d ago  | ainexsuite-notes-xxx.vercel.app |
| journal  | Error  | 3h ago  | ainexsuite-journal-xxx.vercel.app |
| ...      | ...    | ...     | ...                          |

Ready: X/16 | Building: X | Error: X

BUILD CACHE
--------------------------------------------------------------------------------
Cache Status: X tasks cached (FULL TURBO) / Y tasks need rebuild
Last build: <timestamp>

DEPENDENCIES
--------------------------------------------------------------------------------
Outdated packages: X (run `pnpm outdated` for details)
Major updates: X | Minor updates: X | Patch updates: X

TESTS
--------------------------------------------------------------------------------
Status: Passing | X passed | X failed | X skipped

================================================================================
```

## App Reference

| App      | Port | Vercel Project      | Domain                  |
| -------- | ---- | ------------------- | ----------------------- |
| main     | 3000 | ainexsuite-main     | ainexspace.com          |
| notes    | 3001 | ainexsuite-notes    | notes.ainexspace.com    |
| journal  | 3002 | ainexsuite-journal  | journal.ainexspace.com  |
| todo     | 3003 | ainexsuite-todo     | todo.ainexspace.com     |
| health   | 3004 | ainexsuite-health   | health.ainexspace.com   |
| album    | 3005 | ainexsuite-album    | album.ainexspace.com    |
| habits   | 3006 | ainexsuite-habits   | habits.ainexspace.com   |
| mosaic   | 3007 | ainexsuite-mosaic   | mosaic.ainexspace.com   |
| fit      | 3008 | ainexsuite-fit      | fit.ainexspace.com      |
| projects | 3009 | ainexsuite-projects | projects.ainexspace.com |
| flow     | 3010 | ainexsuite-flow     | flow.ainexspace.com     |
| subs     | 3011 | ainexsuite-subs     | subs.ainexspace.com     |
| docs     | 3012 | ainexsuite-docs     | docs.ainexspace.com     |
| tables   | 3013 | ainexsuite-tables   | tables.ainexspace.com   |
| calendar | 3014 | ainexsuite-calendar | calendar.ainexspace.com |
| admin    | 3020 | ainexsuite-admin    | admin.ainexspace.com    |

## Port to App Mapping

Use this mapping to convert port numbers to app names:

```
3000 -> main
3001 -> notes
3002 -> journal
3003 -> todo
3004 -> health
3005 -> album
3006 -> habits
3007 -> mosaic
3008 -> fit
3009 -> projects
3010 -> flow
3011 -> subs
3012 -> docs
3013 -> tables
3014 -> calendar
3020 -> admin
```

## Quick Commands Reference

| Check           | Command                                   |
| --------------- | ----------------------------------------- |
| Running servers | `lsof -i :3000-3020 -P -n \| grep LISTEN` |
| Turbo cache     | `turbo run build --dry-run=json`          |
| Vercel status   | `vercel ls <project> --limit 1`           |
| Outdated deps   | `pnpm outdated`                           |
| Run tests       | `pnpm test`                               |
| Build check     | `pnpm build --dry-run`                    |

## Notes

- Vercel checks may take a few seconds per app; run in parallel batches of 4-5
- If turbo cache shows many misses, suggest running `pnpm build` to warm the cache
- Highlight any apps with Error status in Vercel deployments
- If many dependencies are outdated, suggest running `pnpm update` or `/deps-check`
