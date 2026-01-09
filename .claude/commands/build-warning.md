---
description: Ask before running build commands to avoid conflicts with parallel builds
---

# Build Warning

**IMPORTANT**: Before running any build commands (`pnpm build`, `turbo build`, etc.), always ask the user for confirmation first.

## Rules

1. **Never auto-build** - Do not run `pnpm build` or any build command without explicit user permission
2. **Check for parallel builds** - The user may be running builds in a separate terminal
3. **Ask first** - Always ask: "Should I run the build now, or are you building in parallel?"

## When to Ask

Before running any of these commands:

- `pnpm build`
- `pnpm build --filter <app>`
- `turbo run build`
- `next build`
- Any command that compiles/builds the codebase

## Suggested Prompt

When you need to verify a build, ask:

> "I'd like to run the build to verify the changes. Are you running a build in parallel, or should I go ahead?"

## Alternatives to Full Build

If you just need to check for errors without a full build:

- `pnpm lint` - Check for lint errors only
- `pnpm --filter <app> lint` - Lint specific app
- Type checking in editor - Most type errors show up in VS Code

## After Code Changes

When you've finished making code changes, inform the user:

> "I've completed the changes. When you're ready, run `pnpm build` to verify everything compiles correctly."
