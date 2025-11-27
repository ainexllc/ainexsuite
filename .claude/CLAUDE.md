# AinexSuite

**Turborepo monorepo** | Next.js 15 + React 19 + TypeScript | Firebase/Firestore | Vercel auto-deploy

## Apps

| App | Port | Color | Purpose |
|-----|------|-------|---------|
| main | 3000 | #f97316 | Central dashboard |
| notes | 3001 | #eab308 | Colorful notes |
| journey | 3002 | #f97316 | Mood/reflections |
| todo | 3003 | #8b5cf6 | Task management |
| health | 3004 | #10b981 | Body metrics |
| moments | 3005 | #ec4899 | Memory curation |
| grow | 3006 | #14b8a6 | Personal development |
| pulse | 3007 | #ef4444 | Vitality tracking |
| fit | 3008 | #3b82f6 | Workout tracking |
| projects | 3009 | #6366f1 | Project management |
| workflow | 3010 | #06b6d4 | Visual automation |
| calendar | 3014 | #06b6d4 | Scheduling |
| admin | 3020 | — | Admin dashboard |

## Packages

- **ui** - Shared components (TopNav, AppShell, NavigationPanel, Modal, SpaceSwitcher, etc.)
- **types** - TypeScript definitions
- **theme** - CSS variables, useTheme(), dark/light mode
- **firebase** - Firestore, Auth, Stripe
- **auth** - SSO, session cookies
- **ai** - Gemini, GPT-4, Claude, Grok
- **config** - Tailwind preset, ESLint, TypeScript configs
- **generators** - create-ainex-app, add-grok-ai

## Commands

```bash
pnpm dev                              # All apps
pnpm --filter @ainexsuite/main dev    # Single app
pnpm build                            # REQUIRED before pushing to main
pnpm lint
```

## Rules

1. **Build before push** - `pnpm build` must pass before pushing to main
2. **Multi-app changes** - Apply consistently across all affected apps
3. **Shared components** - Edit in `packages/ui`, not per-app
4. **Types** - Define in `packages/types`
5. **No force push/rebase** without explicit request
