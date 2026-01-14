# env-sync

Sync environment variables between Vercel and local .env files for AinexSuite apps.

## Usage

Parse the command and app name from the user's input after `/env-sync`.

```
/env-sync <command> [app-name] [options]
```

## Commands

### 1. Pull from Vercel

```
/env-sync pull <app-name>
```

Pull environment variables from Vercel to local `.env.local` file.

**Steps:**

1. Validate the app name exists
2. Navigate to the app directory
3. Run: `vercel env pull .env.local --environment=production`
4. Report success/failure

```bash
cd /Users/dinohorn/ainex/ainexsuite/apps/<app-name> && vercel env pull .env.local --environment=production --yes
```

**IMPORTANT:** Never display the actual values of environment variables in output. Only show key names and counts.

---

### 2. Push to Vercel

```
/env-sync push <app-name> <KEY>=<VALUE>
```

Add or update an environment variable in Vercel for a specific app.

**Steps:**

1. Validate the app name exists
2. Parse the KEY=VALUE from the arguments
3. Navigate to the app directory
4. Run the vercel env add command

```bash
cd /Users/dinohorn/ainex/ainexsuite/apps/<app-name> && echo "<VALUE>" | vercel env add <KEY> production --yes
```

**SECURITY WARNING:**

- Never echo or display the VALUE in output
- Confirm with the user before pushing sensitive keys (containing "SECRET", "KEY", "TOKEN", "PASSWORD", "PRIVATE")
- Remind users that env vars will be available to anyone with project access

---

### 3. Diff Environments

```
/env-sync diff <app-name>
```

Compare local `.env.local` with Vercel environment variables.

**Steps:**

1. Read local `.env.local` keys (not values)
2. Run `vercel env ls` to get Vercel keys
3. Compare and report:
   - Keys only in local
   - Keys only in Vercel
   - Keys in both (matched)

```bash
# Get local keys
cd /Users/dinohorn/ainex/ainexsuite/apps/<app-name> && grep -v '^#' .env.local 2>/dev/null | grep '=' | cut -d'=' -f1 | sort

# Get Vercel keys
cd /Users/dinohorn/ainex/ainexsuite/apps/<app-name> && vercel env ls | grep -E '^\w' | awk '{print $1}' | sort
```

**Output format:**

```
Environment Diff for <app-name>:

Missing from Vercel (local only):
- KEY_1
- KEY_2

Missing from local (Vercel only):
- KEY_3

Matched (in both):
- KEY_4
- KEY_5
```

**NEVER show values, only key names.**

---

### 4. Validate Against Template

```
/env-sync validate <app-name>
```

Check that `.env.local` has all keys defined in `.env.example`.

**Steps:**

1. Read keys from `.env.example` (the template)
2. Read keys from `.env.local` (actual config)
3. Report missing required variables

```bash
# Get example keys
cd /Users/dinohorn/ainex/ainexsuite/apps/<app-name> && grep -v '^#' .env.example 2>/dev/null | grep '=' | cut -d'=' -f1 | sort

# Get local keys
cd /Users/dinohorn/ainex/ainexsuite/apps/<app-name> && grep -v '^#' .env.local 2>/dev/null | grep '=' | cut -d'=' -f1 | sort
```

**Output format:**

```
Validation for <app-name>:

Missing required variables (in .env.example but not in .env.local):
- REQUIRED_KEY_1
- REQUIRED_KEY_2

Extra variables (in .env.local but not in .env.example):
- EXTRA_KEY_1

Status: PASS/FAIL
```

---

### 5. Bulk Sync All Apps

```
/env-sync sync-all
```

Pull environment variables for all 16 apps and report status.

**Steps:**

1. Loop through all apps
2. Run `vercel env pull` for each
3. Collect and report results

```bash
# For each app in the list:
cd /Users/dinohorn/ainex/ainexsuite/apps/<app> && vercel env pull .env.local --environment=production --yes
```

**Output format:**

```
Bulk Sync Results:

Success:
- main: 15 variables
- notes: 12 variables
- journal: 14 variables
...

Failed:
- <app>: <error message>

Summary: 15/16 apps synced successfully
```

---

## App Reference

| App      | Vercel Project      | Directory     |
| -------- | ------------------- | ------------- |
| main     | ainexsuite-main     | apps/main     |
| notes    | ainexsuite-notes    | apps/notes    |
| journal  | ainexsuite-journal  | apps/journal  |
| todo     | ainexsuite-todo     | apps/todo     |
| health   | ainexsuite-health   | apps/health   |
| album    | ainexsuite-album    | apps/album    |
| habits   | ainexsuite-habits   | apps/habits   |
| mosaic   | ainexsuite-mosaic   | apps/mosaic   |
| fit      | ainexsuite-fit      | apps/fit      |
| projects | ainexsuite-projects | apps/projects |
| flow     | ainexsuite-flow     | apps/flow     |
| subs     | ainexsuite-subs     | apps/subs     |
| docs     | ainexsuite-docs     | apps/docs     |
| tables   | ainexsuite-tables   | apps/tables   |
| calendar | ainexsuite-calendar | apps/calendar |
| admin    | ainexsuite-admin    | apps/admin    |

## Valid App Names

main, notes, journal, todo, health, album, habits, mosaic, fit, projects, flow, subs, docs, tables, calendar, admin

---

## Security Guidelines

1. **Never display secret values** - Only show key names, never values
2. **Mask output** - If a command might output values, pipe through masking
3. **Confirm sensitive keys** - Ask for confirmation before pushing keys containing SECRET, KEY, TOKEN, PASSWORD, or PRIVATE
4. **Remind about access** - Env vars are visible to all project collaborators
5. **No logging** - Don't log or store env var values anywhere

---

## Error Handling

### Invalid app name

```
Error: "<app-name>" is not a valid app.
Valid apps: main, notes, journal, todo, health, album, habits, mosaic, fit, projects, flow, subs, docs, tables, calendar, admin
```

### Missing arguments

```
Error: Missing required arguments.
Usage: /env-sync <command> [app-name] [options]

Commands:
  pull <app>              Pull env vars from Vercel to local
  push <app> KEY=VALUE    Push env var to Vercel
  diff <app>              Compare local vs Vercel
  validate <app>          Check .env.local against .env.example
  sync-all                Pull env vars for all apps
```

### No .env.local file

```
Warning: No .env.local file found for <app-name>.
Run "/env-sync pull <app-name>" to create one from Vercel.
```

### No .env.example file

```
Warning: No .env.example template found for <app-name>.
Cannot validate without a template. Consider creating apps/<app>/.env.example.
```

---

## Examples

```bash
# Pull env vars for main app
/env-sync pull main

# Push a new API key to notes app
/env-sync push notes NEW_API_KEY=sk_live_xxx

# Check what's different between local and Vercel for journal
/env-sync diff journal

# Validate todo app has all required vars
/env-sync validate todo

# Sync all apps at once
/env-sync sync-all
```
