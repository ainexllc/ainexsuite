# Open Skill

Open an AinexSuite app in the default browser.

## Usage

```
/open <app-name>           # Open localhost dev server
/open <app-name> --prod    # Open production URL
```

## Arguments

- `<app-name>`: Required. One of: main, notes, journal, todo, health, album, habits, mosaic, fit, projects, flow, subs, docs, tables, calendar, admin
- `--prod`: Optional. Open the production URL instead of localhost

## Instructions

1. Validate the app name is one of the supported apps.

2. Determine the URL based on the mode:

### Development URLs (localhost)

| App      | URL                   |
| -------- | --------------------- |
| main     | http://localhost:3000 |
| notes    | http://localhost:3001 |
| journal  | http://localhost:3002 |
| todo     | http://localhost:3003 |
| health   | http://localhost:3004 |
| album    | http://localhost:3005 |
| habits   | http://localhost:3006 |
| mosaic   | http://localhost:3007 |
| fit      | http://localhost:3008 |
| projects | http://localhost:3009 |
| flow     | http://localhost:3010 |
| subs     | http://localhost:3011 |
| docs     | http://localhost:3012 |
| tables   | http://localhost:3013 |
| calendar | http://localhost:3014 |
| admin    | http://localhost:3020 |

### Production URLs

| App      | URL                             |
| -------- | ------------------------------- |
| main     | https://ainexspace.com          |
| notes    | https://notes.ainexspace.com    |
| journal  | https://journal.ainexspace.com  |
| todo     | https://todo.ainexspace.com     |
| health   | https://health.ainexspace.com   |
| album    | https://album.ainexspace.com    |
| habits   | https://habits.ainexspace.com   |
| mosaic   | https://mosaic.ainexspace.com   |
| fit      | https://fit.ainexspace.com      |
| projects | https://projects.ainexspace.com |
| flow     | https://flow.ainexspace.com     |
| subs     | https://subs.ainexspace.com     |
| docs     | https://docs.ainexspace.com     |
| tables   | https://tables.ainexspace.com   |
| calendar | https://calendar.ainexspace.com |
| admin    | https://admin.ainexspace.com    |

3. Open the URL in the default browser:

```bash
open "<url>"   # macOS
```

4. Report the action taken:

   ```
   Opening <app-name> at <url>
   ```

5. For localhost URLs, first check if the app is running:
   ```bash
   lsof -i :<port> -P -n | grep LISTEN
   ```
   If not running, warn the user:
   ```
   Warning: <app-name> doesn't appear to be running on port <port>.
   Start it with: pnpm --filter @ainexsuite/<app-name> dev
   ```
