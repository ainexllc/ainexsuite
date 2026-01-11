---
description: Lint, commit, push code and monitor all Vercel builds
argument-hint: <commit message>
---

Complete deployment workflow: lint, commit, push, and monitor all Vercel builds.

## Arguments

- `$ARGUMENTS` - The commit message (required)

## Steps

1. Run lint to check for errors
2. Stage all changes
3. Create commit with provided message
4. Push to origin
5. Monitor all 16 Vercel app builds until complete

## Execute

First, run lint to ensure code quality:

```bash
pnpm lint 2>&1 | tail -20
```

If lint passes, stage and commit changes:

```bash
git add -A && git status --short
```

Create the commit with the provided message. If no message provided, use a default:

```bash
COMMIT_MSG="${ARGUMENTS:-chore: update}"
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

## Monitor Builds

After pushing, monitor all Vercel deployments. Poll every 30 seconds until all builds complete.

The following projects will be monitored:

- ainexsuite-main
- ainexsuite-notes
- ainexsuite-journal
- ainexsuite-todo
- ainexsuite-health
- ainexsuite-album
- ainexsuite-habits
- ainexsuite-mosaic
- ainexsuite-fit
- ainexsuite-projects
- ainexsuite-flow
- ainexsuite-subs
- ainexsuite-docs
- ainexsuite-tables
- ainexsuite-calendar
- ainexsuite-admin

For each project, check the latest deployment status using `vercel ls <project> --scope ainex-projects` and report:

- Building: Show progress
- Ready: Mark as complete
- Error: Report failure and show error details

Continue polling until all 16 apps show Ready or Error status. Display a summary table at the end showing:

- Project name
- Status (Ready/Error)
- Build duration
- Deployment URL

If any builds fail, fetch the error message using the Vercel API and display it.
