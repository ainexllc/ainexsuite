# Vercel Deployment Guide

Complete guide to deploying your Next.js application to Vercel with automatic deployments from GitHub.

## Overview

**What You'll Set Up:**
- Vercel account and project
- GitHub integration for auto-deployments
- Environment variables
- Custom domain (optional)
- Production and preview deployments

**Time Required:** ~15 minutes

**Prerequisites:**
- GitHub repository with your code
- Firebase project configured (see [firebase-setup.md](./firebase-setup.md))
- `.env.local` with working Firebase config

---

## Step 1: Prepare Your Project

### 1.1 Verify Next.js Configuration

Check `next.config.ts`:

```typescript
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // For static export (Firebase Hosting):
  // output: "export",
  // trailingSlash: true,

  // For Vercel (default - recommended):
  // Leave blank or comment out export settings

  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "lh3.googleusercontent.com", // Google profile pics
      },
    ],
  },
};

export default nextConfig;
```

**Important:** Remove `output: "export"` for Vercel deployment. Vercel uses server-side rendering by default.

### 1.2 Test Local Build

```bash
# Build the project
npm run build

# Expected output:
# ✓ Compiled successfully
# ✓ Linting and checking validity of types
# ✓ Collecting page data
# ✓ Generating static pages
# ✓ Finalizing page optimization
```

**If build fails:**
- Fix TypeScript errors
- Fix ESLint errors
- Ensure all imports are resolved
- Check for missing environment variables

### 1.3 Create `.vercelignore` (Optional)

Create `.vercelignore` to exclude files from deployment:

```
# Development files
.env.local
.env*.local

# Testing
**/*.test.ts
**/*.test.tsx
__tests__/

# Docs (if you don't want to deploy them)
docs/

# Firebase
.firebase/
firebase-debug.log
```

---

## Step 2: Set Up Vercel Account

### 2.1 Create Vercel Account

1. Go to **https://vercel.com**

2. Click **Sign Up**

3. **Sign up with GitHub** (recommended)
   - Authorizes Vercel to access your repositories
   - Enables automatic deployments

4. **Or sign up with email:**
   - Enter email and password
   - You'll need to connect GitHub later

### 2.2 Install Vercel CLI (Optional but Recommended)

```bash
# Install globally
npm install -g vercel

# Verify installation
vercel --version

# Login
vercel login
```

**Benefits of CLI:**
- Deploy from command line
- Pull environment variables locally
- Manage projects and deployments
- View logs and inspect deployments

---

## Step 3: Import Project to Vercel

### Option A: Via Vercel Dashboard (Recommended)

1. **Access Dashboard:**
   - Go to https://vercel.com/dashboard
   - Click **Add New...** → **Project**

2. **Import Git Repository:**
   - You'll see a list of your GitHub repositories
   - Find your project and click **Import**
   - If not visible, click **Adjust GitHub App Permissions** to grant access

3. **Configure Project:**
   - **Project Name:** Auto-filled (you can change it)
   - **Framework Preset:** Next.js (auto-detected)
   - **Root Directory:** `./` (leave default)
   - **Build Command:** `npm run build` (default)
   - **Output Directory:** `.next` (default)
   - **Install Command:** `npm install` (default)

4. **Environment Variables:**
   - Click **Environment Variables** dropdown
   - Add your Firebase config (see Step 4)
   - **Important:** Add variables now before first deployment

5. **Deploy:**
   - Click **Deploy**
   - Wait 1-3 minutes for initial build
   - You'll get a production URL: `https://your-app.vercel.app`

### Option B: Via Vercel CLI

1. **Navigate to project directory:**
   ```bash
   cd ~/ainex/your-app
   ```

2. **Deploy:**
   ```bash
   vercel
   ```

3. **First-time setup prompts:**
   - **Set up and deploy?** Yes
   - **Which scope?** Select your account
   - **Link to existing project?** No
   - **Project name:** Enter name or accept default
   - **Directory location:** `./` (default)
   - **Want to modify settings?** No (use defaults)

4. **Deployment:**
   - Vercel builds and deploys
   - Outputs preview URL
   - Outputs production URL (after running `vercel --prod`)

---

## Step 4: Configure Environment Variables

### 4.1 Add Variables via Dashboard

1. Go to your project on Vercel Dashboard

2. Click **Settings** tab

3. Click **Environment Variables** in left sidebar

4. Add each Firebase variable:

**For each variable:**
- **Key:** `NEXT_PUBLIC_FIREBASE_API_KEY`
- **Value:** Your actual Firebase API key
- **Environment:** Check all (Production, Preview, Development)
- Click **Save**

**Required Firebase variables:**
```
NEXT_PUBLIC_FIREBASE_API_KEY
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN
NEXT_PUBLIC_FIREBASE_PROJECT_ID
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID
NEXT_PUBLIC_FIREBASE_APP_ID
```

### 4.2 Add Variables via CLI

```bash
# Set environment variable
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY

# Prompts:
# - Value: [paste your API key]
# - Environments: Select all (Production, Preview, Development)

# Repeat for each variable
```

### 4.3 Pull Variables Locally (Optional)

```bash
# Download environment variables from Vercel
vercel env pull .env.vercel

# This creates .env.vercel with all production variables
# Don't commit this file to Git
```

### 4.4 Redeploy After Adding Variables

**Important:** Environment variables are only applied to new deployments.

**Trigger new deployment:**
- Push a commit to GitHub (auto-deploys)
- Or redeploy from Vercel Dashboard: **Deployments** → **⋯** → **Redeploy**
- Or via CLI: `vercel --prod`

---

## Step 5: Update Firebase for Production URL

### 5.1 Add Vercel URL to Authorized Domains

1. Go to **Firebase Console** → **Authentication** → **Settings** → **Authorized domains**

2. Click **Add domain**

3. Add your Vercel URLs:
   - `your-app.vercel.app` (production)
   - `your-app-git-main-yourname.vercel.app` (preview)
   - Or use wildcard: `*.vercel.app`

4. Click **Add**

### 5.2 Update OAuth Authorized URIs

1. Go to **Google Cloud Console** → **APIs & Services** → **Credentials**

2. Click your OAuth 2.0 Client ID

3. **Authorized JavaScript origins:**
   - Add: `https://your-app.vercel.app`

4. **Authorized redirect URIs:**
   - Add: `https://your-app.vercel.app/__/auth/handler`

5. Click **Save**

**Note:** Vercel preview deployments have unique URLs. You may need to add those too if testing auth on preview branches.

---

## Step 6: Configure Automatic Deployments

### 6.1 Production Deployments

**Automatic:** Every push to `main` branch triggers production deployment

**Process:**
1. Push code to `main` branch
2. Vercel detects push via GitHub webhook
3. Builds project automatically
4. Deploys to production URL
5. Sends notification (email/Slack)

**To disable auto-deploy:**
1. Go to project Settings → Git
2. Toggle off "Production Branch"

### 6.2 Preview Deployments

**Automatic:** Every push to non-main branches and pull requests

**Process:**
1. Create feature branch and push
2. Vercel creates preview deployment
3. Get unique URL: `your-app-git-feature-yourname.vercel.app`
4. Test changes on preview URL
5. Merge PR → triggers production deployment

**Preview URLs are great for:**
- Testing features before merging
- Sharing work with team/clients
- Running CI/CD checks

### 6.3 Comments on Pull Requests

Vercel automatically comments on PRs with:
- Preview deployment URL
- Build status and logs
- Deployment screenshots (if enabled)

**Enable PR comments:**
1. Go to Settings → Git → Comments
2. Toggle on desired comment types

---

## Step 7: Set Up Custom Domain (Optional)

### 7.1 Add Domain in Vercel

1. Go to your project → **Settings** → **Domains**

2. Enter your domain:
   - `yourdomain.com` (apex domain)
   - `www.yourdomain.com` (subdomain)

3. Click **Add**

### 7.2 Configure DNS

Vercel will show DNS records to add:

**For apex domain** (`yourdomain.com`):
- Type: `A`
- Name: `@`
- Value: `76.76.21.21` (Vercel's IP)

**For www subdomain:**
- Type: `CNAME`
- Name: `www`
- Value: `cname.vercel-dns.com`

**Add these records in your domain registrar:**
1. Go to your domain registrar (Namecheap, GoDaddy, etc.)
2. Find DNS settings
3. Add the A and CNAME records
4. Save changes

### 7.3 Wait for DNS Propagation

- Can take 24-48 hours
- Usually much faster (5-30 minutes)

**Check status:**
```bash
# Check DNS propagation
dig yourdomain.com

# Should show Vercel's IP
```

### 7.4 SSL Certificate

Vercel automatically provisions SSL certificate:
- Uses Let's Encrypt
- Auto-renews every 90 days
- Enables HTTPS automatically

**Your site will be available at:**
- `https://yourdomain.com`
- `https://www.yourdomain.com`
- `https://your-app.vercel.app` (still works)

### 7.5 Update Firebase Authorized Domains

Add your custom domain to Firebase:

1. Firebase Console → Authentication → Settings → Authorized domains
2. Add your domain: `yourdomain.com`
3. Save

Update Google OAuth URIs:
1. Google Cloud Console → Credentials → OAuth Client
2. Add origin: `https://yourdomain.com`
3. Add redirect: `https://yourdomain.com/__/auth/handler`
4. Save

---

## Step 8: Monitor and Manage Deployments

### 8.1 View Deployment Logs

**Via Dashboard:**
1. Go to project → **Deployments**
2. Click on a deployment
3. View **Build Logs** and **Function Logs**

**Via CLI:**
```bash
# View recent deployments
vercel ls

# Inspect specific deployment
vercel inspect <deployment-url>

# View logs
vercel logs <deployment-url>
```

### 8.2 Rollback Deployment

**If something breaks in production:**

**Via Dashboard:**
1. Go to **Deployments**
2. Find a previous working deployment
3. Click **⋯** → **Promote to Production**

**Via CLI:**
```bash
# List deployments
vercel ls

# Rollback to specific deployment
vercel rollback <deployment-url>
```

### 8.3 Delete Deployment

**Via Dashboard:**
1. Go to **Deployments**
2. Click **⋯** → **Delete**

**Via CLI:**
```bash
vercel remove <deployment-url>
```

---

## Troubleshooting

### Build Fails on Vercel

**Common causes:**

1. **TypeScript errors:**
   ```bash
   # Run locally to find errors
   npm run build
   ```
   Fix all TypeScript errors before pushing.

2. **Missing dependencies:**
   ```bash
   # Verify all imports are in package.json
   npm install
   ```

3. **Environment variables:**
   - Check all required variables are set in Vercel
   - Ensure they're available for Production environment

4. **Build command issues:**
   - Verify `package.json` has correct build script
   - Check Node.js version compatibility

**View build logs:**
1. Go to failed deployment
2. Click **Building** step
3. Read error messages

### Google Auth Fails on Vercel

**Issue:** "Redirect URI mismatch" error

**Solution:**
1. Get exact redirect URI from error message
2. Add to Google Cloud Console → Credentials
3. Format: `https://your-app.vercel.app/__/auth/handler`

**Issue:** "Invalid origin" error

**Solution:**
1. Add Vercel URL to "Authorized JavaScript origins"
2. Don't include `/__/auth/handler` in origins (only in redirect URIs)

### Environment Variables Not Working

**Check:**
1. Variables set for correct environment (Production, Preview, Development)
2. Variables prefixed with `NEXT_PUBLIC_` for client-side
3. Redeployed after adding variables
4. No typos in variable names

**Debug:**
```typescript
// Check if variable is loaded
console.log('API Key:', process.env.NEXT_PUBLIC_FIREBASE_API_KEY);
```

### Vercel CLI Login Issues

**Issue:** `vercel login` fails

**Solution:**
```bash
# Logout and login again
vercel logout
vercel login

# Or specify email
vercel login --email you@example.com
```

### Preview Deployment Not Triggering

**Check:**
1. GitHub integration is connected
2. Go to Settings → Git → verify repository is linked
3. Check GitHub webhook settings
4. Ensure commits are pushed to GitHub (not just local)

---

## Performance Optimization

### 1. Enable Analytics

1. Go to project → **Analytics**
2. Click **Enable Analytics**
3. View performance metrics:
   - Page load times
   - Core Web Vitals
   - Geographic distribution

### 2. Enable Speed Insights

```bash
# Install Vercel Speed Insights
npm install @vercel/speed-insights
```

```typescript
// app/layout.tsx
import { SpeedInsights } from '@vercel/speed-insights/next';

export default function RootLayout({ children }) {
  return (
    <html>
      <body>
        {children}
        <SpeedInsights />
      </body>
    </html>
  );
}
```

### 3. Image Optimization

Vercel automatically optimizes images via Next.js Image component:

```tsx
import Image from 'next/image';

<Image
  src="/logo.png"
  width={200}
  height={50}
  alt="Logo"
/>
```

**Benefits:**
- Automatic format conversion (WebP, AVIF)
- Responsive image sizing
- Lazy loading
- CDN caching

### 4. Caching Strategy

Vercel caches:
- Static assets indefinitely
- API routes (configure via headers)
- Next.js pages (based on revalidation)

**Configure revalidation:**
```typescript
// app/page.tsx
export const revalidate = 3600; // Revalidate every hour
```

---

## Security Best Practices

### 1. Secure Environment Variables

- Never commit `.env.local` to Git
- Use Vercel's encrypted environment variables
- Rotate sensitive keys regularly

### 2. Configure Security Headers

Create `next.config.ts` with security headers:

```typescript
const nextConfig: NextConfig = {
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
        ],
      },
    ];
  },
};
```

### 3. Enable DDoS Protection

Vercel includes:
- Automatic DDoS mitigation
- Rate limiting on Edge Network
- Web Application Firewall (WAF) on Pro plan

### 4. Use Preview Deployments for Testing

- Never test untested code on production
- Use preview URLs for staging
- Require PR reviews before merging to main

---

## Next Steps

- [Environment Variables →](./environment-variables.md) - Complete variable reference
- [Firebase Setup →](./firebase-setup.md) - Configure backend services
- [Local Development →](./local-development.md) - Set up dev environment

---

## Quick Reference

**Vercel Dashboard:**
- Main Dashboard: https://vercel.com/dashboard
- Project Settings: https://vercel.com/your-username/your-project/settings

**Essential CLI Commands:**
```bash
vercel                    # Deploy to preview
vercel --prod             # Deploy to production
vercel ls                 # List deployments
vercel inspect <url>      # View deployment details
vercel logs <url>         # View deployment logs
vercel env add            # Add environment variable
vercel env pull           # Download variables locally
vercel rollback <url>     # Rollback to previous deployment
vercel domains add        # Add custom domain
vercel login              # Login to Vercel
vercel logout             # Logout
```

**Important URLs:**
- Production: `https://your-app.vercel.app`
- Preview: `https://your-app-git-branch-username.vercel.app`
- Deployment logs: Project → Deployments → Click deployment

**Environment Variable Best Practices:**
- Prefix with `NEXT_PUBLIC_` for client-side variables
- Set for all environments (Production, Preview, Development)
- Redeploy after adding variables
- Keep sensitive keys server-side only (no `NEXT_PUBLIC_` prefix)
