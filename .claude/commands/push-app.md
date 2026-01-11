---
description: Lint, commit, push and monitor a single app's Vercel build
argument-hint: <app-name> <commit message>
---

Deploy a single app: lint, commit, push, and monitor its Vercel build.

## Arguments

- `$ARGUMENTS` - Format: `<app-name> <commit message>`
  - First word is the app name (e.g., notes, main, todo, journal, health, album, habits, mosaic, fit, projects, flow, subs, docs, tables, calendar, admin)
  - Rest is the commit message

## Examples

```
/push-app notes fix checkbox toggle bug
/push-app main update dashboard layout
/push-app todo feat: add drag and drop
```

## Steps

1. Parse app name from arguments
2. Run lint for the specific app
3. Stage changes in that app's directory
4. Create commit with provided message
5. Push to origin
6. Monitor that app's Vercel build until complete

## Execute

First, parse the arguments to extract app name and commit message:

```bash
ARGS="$ARGUMENTS"
APP_NAME=$(echo "$ARGS" | awk '{print $1}')
COMMIT_MSG=$(echo "$ARGS" | cut -d' ' -f2-)
echo "App: $APP_NAME"
echo "Message: $COMMIT_MSG"
```

Validate the app name exists:

```bash
if [ ! -d "apps/$APP_NAME" ]; then
  echo "Error: App '$APP_NAME' not found in apps/ directory"
  exit 1
fi
```

Run lint for the specific app:

```bash
pnpm --filter @ainexsuite/$APP_NAME lint 2>&1 | tail -20
```

If lint passes, stage changes in the app directory and any shared packages:

```bash
git add apps/$APP_NAME packages/ && git status --short
```

Create the commit with the provided message:

```bash
git commit -m "$(cat <<EOF
$COMMIT_MSG

Co-Authored-By: Claude Opus 4.5 <noreply@anthropic.com>
EOF
)"
```

Push to origin:

```bash
git push origin main
```

## Monitor Build

After pushing, monitor the Vercel deployment for `ainexsuite-$APP_NAME`.

Poll every 15 seconds until the build completes:

```bash
vercel ls ainexsuite-$APP_NAME --scope ainex-projects
```

Check the latest deployment status:

- **Building**: Show progress, continue polling
- **Ready**: Report success with deployment URL and duration
- **Error**: Report failure and fetch error details

Continue polling until status shows Ready or Error. Display final result:

- Project name
- Status (Ready/Error)
- Build duration
- Deployment URL

If build fails, fetch error details using:

```bash
vercel logs <deployment-url> --scope ainex-projects 2>&1 | tail -50
```
