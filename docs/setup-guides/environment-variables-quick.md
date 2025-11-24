# Environment Variables - Quick Reference

## File Structure
```
.env.local           # Local development (gitignored)
.env.production      # Production values (gitignored)
.env.example         # Template for team (committed)
```

## Required Variables

### Firebase Configuration
```env
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=
NEXT_PUBLIC_FIREBASE_MEASUREMENT_ID=  # Optional, for Analytics
```

### Firebase Admin (Server-side)
```env
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=           # Base64 encoded
```

### App Configuration
```env
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_MAIN_DOMAIN=https://yourdomain.com
NODE_ENV=development
```

### Optional - AI Features
```env
OPENAI_API_KEY=
OPENROUTER_API_KEY=
NEXT_PUBLIC_OPENROUTER_API_URL=https://openrouter.ai/api/v1
```

### Optional - Analytics
```env
NEXT_PUBLIC_GA_MEASUREMENT_ID=
```

## Setup Instructions

### 1. Copy Template
```bash
cp .env.example .env.local
```

### 2. Get Firebase Config
**From Firebase Console**:
- Project Settings → General → Your apps
- Copy web app config values

### 3. Get Firebase Admin Key
**From Firebase Console**:
- Project Settings → Service Accounts
- Generate new private key
- Base64 encode the private key:
  ```bash
  echo -n "your-private-key" | base64
  ```

### 4. Verify Variables Load
```typescript
// Check in your app
console.log('Firebase Project:', process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID);
```

## Variable Naming Conventions

### Client-Side (Browser)
- **Prefix**: `NEXT_PUBLIC_*`
- **Access**: Available in browser
- **Example**: `NEXT_PUBLIC_FIREBASE_API_KEY`

### Server-Side Only
- **No prefix**
- **Access**: Server/API routes only
- **Example**: `FIREBASE_ADMIN_PRIVATE_KEY`

## Security Best Practices

✅ **DO**:
- Use `NEXT_PUBLIC_*` only for non-sensitive data
- Keep admin keys server-side only
- Use different Firebase projects for dev/prod
- Add `.env.local` to `.gitignore`

❌ **DON'T**:
- Commit `.env.local` or `.env.production`
- Put API keys in client code directly
- Share environment files publicly
- Use production keys in development

## Deployment

### Vercel
```bash
# Add via CLI
vercel env add NEXT_PUBLIC_FIREBASE_API_KEY

# Or via Dashboard
# Project Settings → Environment Variables
```

### Other Platforms
- Add each variable in platform settings
- Ensure `NEXT_PUBLIC_*` variables are available at build time
- Server-side variables needed at runtime

## Troubleshooting

**Variables not loading**:
```bash
# Restart dev server
pnpm dev

# Check Next.js loads them
console.log(process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID)
```

**Firebase auth fails**:
- Verify all Firebase config variables are set
- Check no extra quotes or whitespace
- Confirm auth domain matches Firebase project

**Vercel deployment issues**:
- Verify all vars added to Vercel project
- Check variable scope (Production/Preview)
- Redeploy after adding variables

For detailed guide, see `environment-variables.md`
