# Repository Guidelines

## Project Structure & Module Organization
This app lives inside the Turborepo workspace at `apps/workflow` and follows the Next.js App Router layout. Route handlers and pages belong in `src/app`, while reusable UI sits in `src/components` (for example `workflow-canvas` bundles nodes, hooks, and toolbar logic). Shared state such as theming resides in `src/contexts`, and cross-cutting utilities live under `src/lib` (Firebase helpers, theming primitives). Keep environment access centralized in `src/env.ts` instead of sprinkling `process.env` references inside components.

## Build, Test, and Development Commands
- `pnpm dev --filter @ainexsuite/workflow` (or `npm run dev` here) starts Next dev mode on port 3010 with hot reload.
- `pnpm build --filter @ainexsuite/workflow` runs `next build` plus the shared `build:deps` step; use it before shipping or tagging releases.
- `pnpm lint --filter @ainexsuite/workflow` executes ESLint with the Next config and fails on warnings.
- `pnpm deploy --filter @ainexsuite/workflow` forwards to the Vercel production deploy target; dry-run with `--preview` when testing.

## Coding Style & Naming Conventions
The codebase is TypeScript-first, so prefer typed props, discriminated unions, and helpers from `@ainexsuite/types`. Stick to 2-space indentation, single quotes, semicolons, and Tailwind utility classes for styling. Components/contexts use `PascalCase`, hooks use `useCamelCase`, and multiword files use kebab-case (`workflow-canvas.css`). Place `'use client'` at the top of interactive modules, import colors from `src/lib/themes.ts`, and run `pnpm format` at the repo root for Markdown or JSON touch-ups.

## Testing Guidelines
Workspace-level testing is orchestrated by Turborepo, so scope commands, e.g. `pnpm test --filter @ainexsuite/workflow`. Co-locate component tests next to their feature (`__tests__` or `*.test.tsx`) and use React Testing Library with Jest DOM matchers. Mock Firebase via the shared helpers and cover undo/redo history, keyboard shortcuts, and React Flow edge validation. Attach short clips or screenshots to PRs whenever canvas behavior changes.

## Commit & Pull Request Guidelines
Follow the capitalized prefixes seen in history (`Feat:`, `Fix:`, `Docs:`) plus an imperative summary. PR descriptions should note the problem, solution, validation commands, and any linked issues or Turbo build IDs. Include UI screenshots for visual tweaks, call out new env vars, and confirm lint/build/test checks pass before requesting review.

## Security & Configuration Tips
The app reads Firebase credentials only through `src/env.ts`; keep those variables in `.env.local` and never commit secrets. Run `pnpm run build:deps` after touching shared packages so the workspace stays in sync, and prefer `useAuth`/`@ainexsuite/firebase` helpers over raw SDK calls to preserve auth guards.
