# Homepage Unification Plan

## Objective
- Recreate the main app’s public homepage look and feel inside every AINexSuite app without introducing shared React components.
- Allow each app to own fully customized copy, data, and component implementations while matching the design system.
- Preserve existing authenticated dashboards by relocating them to `/workspace`.
- Maintain consistency for branding, navigation patterns, authentication, analytics, and legal links.

## Dependencies & References
- Source homepage: `apps/main/src/app/page.tsx`
- Shared components/assets: `apps/main/src/components/*`, `@ainexsuite/ui`
- Auth context: `@ainexsuite/auth` (`AuthProvider`, `useAuth`, `SuiteGuard`)
- Firebase auth flows: `@ainexsuite/firebase`
- Tailwind styles: `@ainexsuite/ui/styles`, per-app `globals.css`
- Marketing routes to reconcile: `/features`, `/pricing`, `/faq`, `/about`, `/help`, `/docs`, `/privacy`, `/terms`, `/cookies`, `/acceptable-use`, `/gdpr`, `/contact`, `/blog`

---

## Phase 0 — Discovery & Alignment
- [ ] Document all moving parts of `PublicHomePage` (data arrays, components, auth handlers, icons, styles).
- [ ] Audit per-app entrypoints (`apps/*/src/app/page.tsx`) to log current functionality, routes, and dependencies.
- [ ] Confirm workspace/dashboard routes exist or need to be created in each app (`/workspace`).
- [ ] Decide navigation strategy for marketing links (share from main vs. duplicate content vs. external URLs).
- [ ] Identify any app-specific SEO metadata or favicons that must remain distinct.

### Style Reference (WIP)
- **Header**: dark translucent bar (`bg-[#050505]/90`), border `border-white/10`, desktop nav uses `md:flex`, mobile menu toggled with `Menu`/`X`.
- **Backgrounds**: root wrapper `bg-[#050505] text-white` with layered radial gradients and blurred orbs (`bg-[radial-gradient(circle_at_top,...)]`).
- **Hero section**: grid layout `max-w-7xl` with left copy column and right auth card; CTA pill uses `border-white/10 bg-zinc-800/70`.
- **Auth card**: rounded `rounded-3xl`, gradient glow backdrop, form inputs `border-white/15 bg-white/5`, Google button `border-white/15 bg-white/10`.
- **Features block**: video container `aspect-video rounded-3xl border-white/10`, feature cards `rounded-3xl bg-zinc-800/90`.
- **AI highlights**: list items `rounded-2xl border-white/10 bg-zinc-800/80`, highlight emojis sized `text-xl`.
- **Testimonials/grid section**: use of `bg-black` overlays, gradient text, grid of quotes with `border-white/10`.
- **Mobile nav behavior**: `isMobileMenuOpen` toggles `absolute` nav list with `rounded-2xl` items.
- **Typography**: headings `font-semibold`, gradient text uses `bg-gradient-to-r from-[#FF7A18] to-[#FFB347]`.
- **Icons**: lucide icons sized 3.5-7, accent color `#f97316`.

### Functional Notes
- Landing page uses `useAuth` to gate redirect: authenticated users see loader and auto-redirect to `/workspace`.
- Auth card supports email/password with sign-up toggle and Google OAuth via Firebase; success pushes to `/workspace`.
- Demo headline ticker cycles `demoSteps` using `setInterval` (3.2s) to animate messaging.
- Navigation links array drives both desktop and mobile nav; ensure per-app URLs align with available routes.
- Feature cards and AI highlights map over local data arrays for copy; per-app pages can define unique arrays while maintaining card structure.
- Footer imported from `@ainexsuite/ui` with per-app link sets; adjust `appName` and link targets per product.
- Responsive behavior relies on Tailwind breakpoints (`md:hidden`, `lg:grid-cols`, etc.); test across mobile/tablet/desktop widths.
- Background glow elements rely on absolutely positioned divs with `blur-[150px]` etc.; replicate for consistent ambience.

## Phase 1 — Visual Reference & Style Guide
- [ ] Break down the main homepage into design sections (hero, nav bar, features, AI highlights, footers, auth modal) with screenshots and notes.
- [ ] Catalogue all Tailwind classes, color tokens, spacing, and typography choices used throughout the main homepage.
- [ ] Document interactive behaviors (mobile nav, hover states, auth modals) and write an implementation checklist.
- [ ] Capture reusable CSS snippets or utility class combinations in a style guide doc (no shared components, only guidance).
- [ ] Store any shared assets (logos, gradients) in a central `public/branding/` folder each app can copy from.
- [ ] Produce a reference Figma or design spec (optional) to visualize the target layout for engineers.

## Phase 2 — Per-App Implementation
- [ ] For each app (`fit`, `grow`, `journey`, `moments`, `notes`, `pulse`, `todo`, `track`, `main`):
  - [x] `fit` — Workspace moved to `/workspace`, marketing homepage rebuilt with Fit-specific copy.
  - [x] `grow` — Workspace separated and marketing homepage customized for learning experiences.
  - [x] `notes` — Workspace separated and marketing homepage tailored for connected note-taking.
  - [x] `todo` — Workspace separated and marketing homepage aligned with planning/operations messaging.
  - [x] `pulse` — Workspace separated and marketing homepage focused on health analytics.
  - [x] `track` — Workspace separated and marketing homepage centered on habit momentum.
  - [x] `journey` — Workspace separated and marketing homepage celebrating reflective journaling.
  - [x] `moments` — Workspace separated and marketing homepage highlighting multimedia storytelling.
  - [x] `main` — Serves as the reference marketing homepage; no changes required beyond continued maintenance.
- [x] Relocate authenticated dashboard from `/page.tsx` to `/workspace/page.tsx` (preserve `SuiteGuard`).
- [x] Build a fresh `src/app/page.tsx` replicating the main design using the documented Tailwind classes and layout guidance.
- [x] Customize content (headlines, imagery, calls-to-action) to reflect the app’s unique value while keeping structure consistent.
- [x] Ensure `/workspace` imports any CSS/modules previously loaded at root.
- [x] Adjust `layout.tsx` metadata if necessary (title, description).
- [x] Verify API routes/middleware still align with new structure.
- [x] Confirm navigation within each homepage points to the correct per-app workspace URL (e.g. `router.push('/workspace')`).

## Phase 3 — Marketing Content Parity
- [ ] Determine handling for marketing subroutes (Option A vs. B) per app:
  - [x] Fit — Local `/features`, `/pricing`, `/faq`, `/about` pages with product copy.
  - [ ] Grow — Decide on local vs. shared pages.
  - [ ] Notes — Decide on local vs. shared pages.
  - [ ] Todo — Decide on local vs. shared pages.
  - [ ] Pulse — Decide on local vs. shared pages.
  - [ ] Track — Decide on local vs. shared pages.
  - [ ] Journey — Decide on local vs. shared pages.
  - [ ] Moments — Decide on local vs. shared pages.
  - [x] Main — Reference implementation.
- [ ] Align shared assets (hero images, favicons) across apps; copy to each repo as needed.
- [ ] Ensure legal/footer links resolve correctly in every app environment; customize copy if required.
- [ ] Review localization/analytics hooks for consistency (cookie banners, tracking scripts) and replicate per app.
- [x] Standardize marketing navigation/footer links to point at `NEXT_PUBLIC_MAIN_DOMAIN`, adding env support where missing.

## Phase 4 — Validation & QA
- [x] Run `pnpm lint --filter @ainexsuite/*` after integration.
- [ ] Build each app (`pnpm build --filter @ainexsuite/<app>`) to confirm Next.js compilation.
- [ ] Smoke test locally:
  - [ ] Anonymous visit to `/` shows marketing page.
  - [ ] Email/password sign-in routes to `/workspace`.
  - [ ] Google auth popup flow matches main app behavior.
  - [ ] Authenticated reload of `/` redirects to `/workspace` if applicable.
- [ ] Update automated tests (unit, integration, e2e) for new route structure.

## Phase 5 — Rollout & Communication
- [ ] Sequence deployments so shared package publishes before consuming apps.
- [ ] Update release notes, internal docs, and support knowledge base about the new unified homepage.
- [ ] Notify stakeholders (product, marketing, CS) of the change and any new URLs.
- [ ] Monitor error logs/analytics post-deploy for unexpected redirects or auth regressions.

---

### Parking Lot / Open Questions
- Do we centralize marketing copy updates via CMS or keep per-app static arrays in code?
- Which sections must stay identical vs. optional/omit-able per app?
- Should the homepage CTA redirect to app-specific workspace or the main suite selector?
- Are there app-specific experiments/flags that conflict with the shared landing components?
- Does any app require a custom favicon or metadata slot that should remain unique?
