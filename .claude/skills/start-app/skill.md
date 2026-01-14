# start-app

Start a specific AinexSuite app by name.

## Usage

```
/start-app <appname>
```

## Instructions

1. Parse the app name from the user's input
2. Validate it exists in the app list below
3. Get the corresponding port
4. Check if port is already in use - if so, ask user if they want to restart
5. Start the app with the filter command

### Start the app

```bash
cd /Users/dinohorn/ainex/ainexsuite && pnpm --filter @ainexsuite/<appname> dev
```

Run in background so user can continue working.

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
