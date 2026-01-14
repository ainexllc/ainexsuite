# start-all

Start all AinexSuite dev servers.

## Instructions

Execute this command to start all dev servers:

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
