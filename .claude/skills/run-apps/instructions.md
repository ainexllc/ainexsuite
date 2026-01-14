# run-apps

Start specific AinexSuite dev servers.

## Instructions

Parse the app names from the user's input. The apps should be passed as space-separated arguments after `/run-apps`.

**Example usage:**

- `/run-apps main notes` - Start main and notes apps
- `/run-apps todo habits health` - Start todo, habits, and health apps

Build the turbo filter command dynamically based on the apps provided:

```bash
cd /Users/dinohorn/ainex/ainexsuite && pnpm turbo run dev --filter=@ainexsuite/<app1> --filter=@ainexsuite/<app2> ... --concurrency=30
```

Run the command in the background so the user can continue working.

If no apps are specified, prompt the user to provide at least one app name.

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

## Valid App Names

main, notes, journal, todo, health, album, habits, mosaic, fit, projects, flow, subs, docs, tables, calendar, admin
