# Fix: Vercel Output Directory Error

## Error Message
```
Error: No Output Directory named ".next" found after the Build completed.
Configure the Output Directory in your Project Settings.
```

## Root Cause
The Vercel project has `Root Directory` set to `apps` in the dashboard, but the build output is in `apps/main/.next`. Vercel is looking in the wrong location.

## Solution: Update Vercel Project Settings

### For ainexsuite Project (Main App)

1. Go to https://vercel.com/dinohorn35-gmailcoms-projects/ainexsuite/settings/general

2. Scroll to **Root Directory**

3. Change from: `apps`
   To: `apps/main` ← This tells Vercel where the app actually is

4. Scroll to **Output Directory** (should auto-fill to `.next`)
   - If empty, set to: `.next`

5. Click **Save**

6. Trigger a new deployment:
   ```bash
   git commit --allow-empty -m "Trigger rebuild"
   git push origin main
   ```

## Expected Build Flow

With correct settings (`Root Directory: apps/main`):

```
1. Vercel clones repo
2. Changes to: /vercel/path0/apps/main/  (Root Directory)
3. Runs: cd ../.. && pnpm install && pnpm turbo run build --filter=@ainexsuite/main
4. Build outputs to: /vercel/path0/apps/main/.next
5. Vercel finds .next in current directory ✅
```

## Alternative Solution: Use vercel.json

If you can't access the dashboard, add a `vercel.json` at repository root:

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "pnpm install && pnpm turbo run build --filter=@ainexsuite/main",
  "installCommand": "pnpm install",
  "outputDirectory": "apps/main/.next",
  "framework": "nextjs",
  "ignoreCommand": "git diff --quiet HEAD^ HEAD -- ./apps/main ./packages ./package.json ./pnpm-lock.yaml ./turbo.json"
}
```

**Note**: Root-level `vercel.json` overrides dashboard settings.

## Verification

After fixing, you should see in the build logs:

```
✓ Compiled successfully
✓ Generating static pages
✓ Finalizing page optimization

Build Completed in ...
```

## For Individual App Projects

When you create separate Vercel projects for each app (recommended approach from VERCEL_SETUP_GUIDE.md):

| Project | Root Directory | Output Directory |
|---------|---------------|------------------|
| ainexsuite-main | `apps/main` | `.next` |
| ainexsuite-notes | `apps/notes` | `.next` |
| ainexsuite-journey | `apps/journey` | `.next` |
| ainexsuite-todo | `apps/todo` | `.next` |

Each project's Root Directory points directly to the app, so output directory is simply `.next`.

## Quick Fix Commands

```bash
# Option 1: Update via Vercel dashboard (recommended)
# Visit: https://vercel.com/your-project/settings/general

# Option 2: Trigger rebuild after dashboard fix
git commit --allow-empty -m "chore: trigger rebuild"
git push origin main

# Option 3: Deploy via CLI with correct settings
cd apps/main
vercel --prod
```

## Status
✅ Root cause identified
⏳ Awaiting dashboard configuration update
🔄 Ready to deploy after fix

---

**Next Steps**:
1. Update Root Directory to `apps/main` in Vercel dashboard
2. Trigger new deployment
3. Verify build succeeds
4. Follow VERCEL_SETUP_GUIDE.md to create individual app projects
