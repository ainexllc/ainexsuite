# bundle-check

Monitor and compare bundle sizes to prevent regressions in AinexSuite apps.

## Usage

```
/bundle-check <app-name>              # Analyze single app bundle
/bundle-check <app-name> --compare    # Compare to baseline sizes
/bundle-check all                     # Quick size check for all apps
/bundle-check <app-name> --unused     # Find unused dependencies
```

## Arguments

- `<app-name>`: One of: main, notes, journal, todo, health, album, habits, mosaic, fit, projects, flow, subs, docs, tables, calendar, admin
- `--compare`: Compare current build to last known sizes and flag increases > 10%
- `--unused`: Find unused dependencies that can be removed
- `all`: Check all 16 apps

## Instructions

### 1. Analyze Single App

When the user runs `/bundle-check <app-name>`:

1. Validate the app name is one of the 16 supported apps.

2. Build the app with bundle analyzer enabled:

   ```bash
   cd /Users/dinohorn/ainex/ainexsuite && ANALYZE=true pnpm --filter @ainexsuite/<app-name> build 2>&1
   ```

3. Parse the build output to extract bundle information. Next.js outputs build information like:

   ```
   Route (app)                              Size     First Load JS
   + First Load JS shared by all            XX kB
   ```

4. Additionally, check the `.next` directory for detailed stats:

   ```bash
   # Get total .next folder size
   du -sh /Users/dinohorn/ainex/ainexsuite/apps/<app-name>/.next 2>/dev/null

   # List largest chunks
   find /Users/dinohorn/ainex/ainexsuite/apps/<app-name>/.next/static -name "*.js" -exec ls -lh {} \; 2>/dev/null | sort -k5 -hr | head -10

   # Check for CSS files
   find /Users/dinohorn/ainex/ainexsuite/apps/<app-name>/.next/static -name "*.css" -exec ls -lh {} \; 2>/dev/null
   ```

5. If ANALYZE=true generates `.next/analyze/` output, check for those files:

   ```bash
   ls -la /Users/dinohorn/ainex/ainexsuite/apps/<app-name>/.next/analyze/ 2>/dev/null
   ```

6. Present the output in a table format:

```
================================================================================
                    BUNDLE ANALYSIS: @ainexsuite/<app-name>
================================================================================

ROUTE SIZES
--------------------------------------------------------------------------------
| Route                    | Size    | First Load JS | Status    |
|--------------------------|---------|---------------|-----------|
| /                        | 5.2 KB  | 87.3 KB       | OK        |
| /[noteId]                | 3.1 KB  | 85.2 KB       | OK        |
| /_not-found              | 137 B   | 82.2 KB       | OK        |

First Load JS shared by all: 82.1 KB

LARGEST CHUNKS (JS)
--------------------------------------------------------------------------------
| File                           | Size     |
|--------------------------------|----------|
| main-abc123.js                 | 45.2 KB  |
| webpack-def456.js              | 12.3 KB  |
| page-ghi789.js                 | 8.7 KB   |

CSS FILES
--------------------------------------------------------------------------------
| File                           | Size     |
|--------------------------------|----------|
| globals-xyz.css                | 15.4 KB  |

TOTAL BUILD SIZE
--------------------------------------------------------------------------------
Total .next directory: 2.3 MB

RECOMMENDATIONS
--------------------------------------------------------------------------------
[!] Warning: First Load JS > 200KB - consider code splitting
[i] Info: Bundle size within normal range
================================================================================
```

### 2. Compare to Baseline (--compare)

When `/bundle-check <app-name> --compare` is used:

1. Check for baseline file:

   ```bash
   cat /Users/dinohorn/ainex/ainexsuite/apps/<app-name>/.bundle-baseline.json 2>/dev/null
   ```

2. If baseline exists, compare current build output to baseline values.

3. If baseline doesn't exist, suggest creating one:

   ```
   No baseline found. Run build and save baseline:
   /bundle-check <app-name> --save-baseline
   ```

4. Show comparison output:

```
================================================================================
                BUNDLE COMPARISON: @ainexsuite/<app-name>
================================================================================

| Route          | Baseline  | Current   | Change    | Status    |
|----------------|-----------|-----------|-----------|-----------|
| /              | 85.0 KB   | 87.3 KB   | +2.7%     | OK        |
| /[noteId]      | 83.0 KB   | 95.2 KB   | +14.7%    | WARNING   |
| Shared JS      | 80.0 KB   | 82.1 KB   | +2.6%     | OK        |

[!] WARNING: /[noteId] increased by 14.7% (threshold: 10%)
    Previous: 83.0 KB -> Current: 95.2 KB
    Investigate recent changes to this route.

================================================================================
```

### 3. Check All Apps

When `/bundle-check all` is used:

1. Run a quick build check for all 16 apps (can run sequentially or in small batches):

   ```bash
   cd /Users/dinohorn/ainex/ainexsuite && pnpm turbo run build --filter='./apps/*' --dry-run=json 2>/dev/null | head -200
   ```

2. For actual sizes, check existing `.next` directories:

   ```bash
   for app in main notes journal todo health album habits mosaic fit projects flow subs docs tables calendar admin; do
     size=$(du -sh /Users/dinohorn/ainex/ainexsuite/apps/$app/.next 2>/dev/null | cut -f1)
     echo "$app: $size"
   done
   ```

3. Present sorted by size:

```
================================================================================
                    BUNDLE SIZES: ALL APPS
================================================================================

| App      | Build Size | Status    | Last Built          |
|----------|------------|-----------|---------------------|
| main     | 4.2 MB     | WARNING   | 2024-01-14 10:30    |
| notes    | 2.8 MB     | OK        | 2024-01-14 09:15    |
| journal  | 2.3 MB     | OK        | 2024-01-13 18:20    |
| todo     | 2.1 MB     | OK        | 2024-01-14 08:00    |
| ...      | ...        | ...       | ...                 |

Total: 38.5 MB across 16 apps
Largest: main (4.2 MB)
Smallest: mosaic (1.2 MB)

[!] Apps with WARNING status may need optimization review
================================================================================
```

### 4. Find Unused Dependencies (--unused)

When `/bundle-check <app-name> --unused` is used:

1. Check if depcheck is available, if not suggest installing:

   ```bash
   which depcheck || echo "Install depcheck: npm install -g depcheck"
   ```

2. Run depcheck on the app:

   ```bash
   cd /Users/dinohorn/ainex/ainexsuite/apps/<app-name> && npx depcheck --json 2>/dev/null
   ```

3. If depcheck is not available, do manual analysis:

   ```bash
   # List dependencies from package.json
   cat /Users/dinohorn/ainex/ainexsuite/apps/<app-name>/package.json | grep -A 100 '"dependencies"' | grep -B 100 '"devDependencies"'

   # Search for actual usage in source files
   cd /Users/dinohorn/ainex/ainexsuite/apps/<app-name> && grep -r "from '[^']*'" src/ --include="*.ts" --include="*.tsx" 2>/dev/null | head -50
   ```

4. Present findings:

```
================================================================================
                UNUSED DEPENDENCIES: @ainexsuite/<app-name>
================================================================================

UNUSED DEPENDENCIES (can be removed)
--------------------------------------------------------------------------------
| Package                  | Type      | Size Impact |
|--------------------------|-----------|-------------|
| lodash                   | dependency| ~70 KB      |
| moment                   | dependency| ~288 KB     |
| unused-util              | devDep    | N/A         |

MISSING DEPENDENCIES (used but not declared)
--------------------------------------------------------------------------------
| Package                  | Used In              |
|--------------------------|----------------------|
| some-package             | src/components/...   |

RECOMMENDATIONS
--------------------------------------------------------------------------------
To remove unused dependencies:
  pnpm --filter @ainexsuite/<app-name> remove lodash moment unused-util

Potential bundle size savings: ~358 KB
================================================================================
```

## Size Thresholds

Use these thresholds for status indicators:

| Metric           | OK       | WARNING   | CRITICAL |
| ---------------- | -------- | --------- | -------- |
| First Load JS    | < 150 KB | 150-200KB | > 200 KB |
| Total Build Size | < 3 MB   | 3-5 MB    | > 5 MB   |
| Single Chunk     | < 100 KB | 100-200KB | > 200 KB |
| Size Increase    | < 5%     | 5-10%     | > 10%    |

## Status Icons

- OK: Bundle size within normal range
- [!] WARNING: Approaching threshold or moderate increase
- [x] CRITICAL: Exceeds threshold or large regression

## App Reference

| App      | Port | Expected Size | Notes                        |
| -------- | ---- | ------------- | ---------------------------- |
| main     | 3000 | 2-4 MB        | Dashboard, multiple features |
| notes    | 3001 | 2-3 MB        | Rich text editor             |
| journal  | 3002 | 2-3 MB        | Mood tracking                |
| todo     | 3003 | 2-3 MB        | Task management              |
| health   | 3004 | 2-3 MB        | Charts, metrics              |
| album    | 3005 | 2-3 MB        | Image handling               |
| habits   | 3006 | 2-3 MB        | Streak tracking              |
| mosaic   | 3007 | 1-2 MB        | Simpler dashboard            |
| fit      | 3008 | 2-4 MB        | Workout tracking, charts     |
| projects | 3009 | 2-4 MB        | Kanban, project views        |
| flow     | 3010 | 3-5 MB        | Node-based editor            |
| subs     | 3011 | 2-3 MB        | Subscription tracking        |
| docs     | 3012 | 3-5 MB        | Rich document editor         |
| tables   | 3013 | 3-5 MB        | Spreadsheet features         |
| calendar | 3014 | 2-4 MB        | Calendar views               |
| admin    | 3020 | 2-3 MB        | Admin features               |

## Notes

- Building with `ANALYZE=true` may open browser windows with bundle visualizations
- If @next/bundle-analyzer is not installed, the ANALYZE flag won't produce visual output
- For accurate comparison, ensure builds are done with the same environment (production mode)
- Large increases often indicate:
  - New heavy dependencies added
  - Importing entire libraries instead of specific functions
  - Large data files being bundled
  - Missing code splitting for routes

## Quick Commands Reference

| Task                 | Command                                                 |
| -------------------- | ------------------------------------------------------- |
| Single app analysis  | `ANALYZE=true pnpm --filter @ainexsuite/<app> build`    |
| Check .next size     | `du -sh apps/<app>/.next`                               |
| Find large chunks    | `find apps/<app>/.next/static -name "*.js" -size +100k` |
| List all chunk sizes | `ls -lhS apps/<app>/.next/static/chunks/*.js`           |
| Find unused deps     | `npx depcheck apps/<app>`                               |
| Remove dependency    | `pnpm --filter @ainexsuite/<app> remove <package>`      |
