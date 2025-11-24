# Vercel Deployment - Quick Reference

## Prerequisites
- GitHub account with repository
- Vercel CLI: `npm install -g vercel`

## 1. Connect Vercel to GitHub
```bash
# Login
vercel login

# Link project
vercel link
```

## 2. Environment Variables
**Add via Vercel Dashboard**:
- Project Settings → Environment Variables
- Add all `NEXT_PUBLIC_*` variables
- Add server-side variables (separate from client)

**Or via CLI**:
```bash
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY
# Repeat for each variable
```

## 3. Configure Build Settings
**Turborepo monorepo**:
```json
// vercel.json (in app directory)
{
  "buildCommand": "cd ../.. && npx turbo run build --filter=@ainexsuite/main",
  "outputDirectory": ".next",
  "installCommand": "pnpm install"
}
```

**Root directory**: `apps/main` (or specific app)

## 4. Deploy
```bash
# Preview deployment
vercel

# Production deployment
vercel --prod
```

## 5. Custom Domain (Optional)
- Vercel Dashboard → Domains
- Add domain → Follow DNS instructions
- Wait for propagation (5-10 minutes)

## 6. Auto-Deploy Setup
**GitHub Integration**:
- Production branch: `main`
- Preview branches: All other branches
- Auto-deploy on push: Enabled

## Common Issues

### Build Fails
```bash
# Test build locally first
pnpm build

# Check Vercel logs
vercel logs --scope=your-team
```

### Environment Variables Missing
- Verify all `NEXT_PUBLIC_*` vars are set
- Check variable scope (Production/Preview/Development)
- Redeploy after adding variables

### Turborepo Cache Issues
```bash
# Clear cache and rebuild
rm -rf .turbo .next
pnpm build
```

## Monitoring
```bash
# View deployments
vercel list

# Inspect specific deployment
vercel inspect <deployment-url> --logs

# Check project status
vercel project ls
```

## Useful Commands
```bash
# Remove deployment
vercel remove <deployment-url>

# Rollback (redeploy previous)
vercel rollback <deployment-url>

# Pull environment variables
vercel env pull
```

For detailed setup, see `vercel-deployment.md`
