# Local Development Setup

Complete guide to setting up your local development environment for AiNex applications.

## Prerequisites

### Required Software

1. **Node.js** (v18.17 or higher)
   ```bash
   # Check version
   node --version

   # Install via Homebrew (macOS)
   brew install node

   # Or download from https://nodejs.org
   ```

2. **npm** (v9 or higher, comes with Node.js)
   ```bash
   npm --version
   ```

3. **Git**
   ```bash
   # Check version
   git --version

   # Install via Homebrew (macOS)
   brew install git
   ```

4. **Firebase CLI** (for Firebase features)
   ```bash
   # Install globally
   npm install -g firebase-tools

   # Verify installation
   firebase --version
   ```

5. **Code Editor** - Recommended: VS Code
   - Download from https://code.visualstudio.com

---

## Project Setup

### 1. Clone or Create Project

**Option A: Clone existing project**
```bash
cd ~/ainex
git clone https://github.com/yourusername/your-app.git
cd your-app
```

**Option B: Use starter template**
```bash
cd ~/ainex
cp -r ainex-app-starter my-new-app
cd my-new-app
```

**Option C: Create from scratch**
```bash
npx create-next-app@latest my-app --typescript --tailwind --app --no-src-dir
cd my-app
```

### 2. Install Dependencies

```bash
# Install all dependencies
npm install

# This will install:
# - Next.js 15.5.4
# - React 19.1.0
# - TailwindCSS 3.4.15
# - Firebase 11.2.0
# - All other dependencies from package.json
```

**Common installation issues:**

**Error: `EACCES` permission denied**
```bash
# Fix npm permissions
sudo chown -R $USER /usr/local/lib/node_modules
```

**Error: `peer dependency` warnings**
```bash
# Usually safe to ignore, but can force install
npm install --legacy-peer-deps
```

### 3. Environment Variables

Create `.env.local` file in project root:

```bash
# Copy example file
cp .env.example .env.local

# Or create manually
touch .env.local
```

Add your Firebase configuration (see [firebase-setup.md](./firebase-setup.md) for details):

```env
# Firebase Configuration
NEXT_PUBLIC_FIREBASE_API_KEY=your_api_key_here
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
NEXT_PUBLIC_FIREBASE_PROJECT_ID=your-project-id
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=your_sender_id
NEXT_PUBLIC_FIREBASE_APP_ID=your_app_id
```

**Important:** Never commit `.env.local` to Git. It's already in `.gitignore`.

---

## Development Server

### Start Development Server

```bash
# Start with Turbopack (faster)
npm run dev

# Or start with default webpack
next dev
```

**Expected output:**
```
▲ Next.js 15.5.4
- Local:        http://localhost:3000
- Environments: .env.local

✓ Ready in 2.1s
```

### Access Your Application

Open browser to: **http://localhost:3000**

### Change Port

```bash
# Use custom port
npm run dev -- -p 3001

# Or set in package.json
"dev": "next dev --turbopack -p 3001"
```

---

## Firebase Emulator Setup (Optional but Recommended)

Run Firebase services locally without using production resources.

### 1. Initialize Firebase Emulators

```bash
# Login to Firebase
firebase login

# Initialize emulators
firebase init emulators
```

**Select emulators:**
- [x] Authentication Emulator
- [x] Firestore Emulator
- [x] Storage Emulator (if using storage)

**Default ports:**
- Authentication: 9099
- Firestore: 8080
- Emulator UI: 4000

### 2. Update Environment Variables

Add to `.env.local`:

```env
# Emulator URLs (only for local development)
NEXT_PUBLIC_USE_FIREBASE_EMULATOR=true
NEXT_PUBLIC_FIRESTORE_EMULATOR_HOST=localhost:8080
NEXT_PUBLIC_AUTH_EMULATOR_URL=http://localhost:9099
```

### 3. Start Emulators

```bash
# Start all emulators
firebase emulators:start

# Or start specific emulators
firebase emulators:start --only firestore,auth
```

### 4. Access Emulator UI

Open: **http://localhost:4000**

View and manage:
- Firestore data
- Authentication users
- Emulator logs

---

## VS Code Setup

### Recommended Extensions

Install these extensions for optimal development:

1. **ESLint** (`dbaeumer.vscode-eslint`)
   - Real-time linting and error detection

2. **Prettier** (`esbenp.prettier-vscode`)
   - Code formatting

3. **Tailwind CSS IntelliSense** (`bradlc.vscode-tailwindcss`)
   - Autocomplete for Tailwind classes

4. **TypeScript Vue Plugin (Volar)** (`Vue.volar`)
   - Better TypeScript support

5. **Firebase** (`toba.vsfire`)
   - Firebase syntax highlighting

6. **Error Lens** (`usernamehw.errorlens`)
   - Inline error display

### VS Code Settings

Create `.vscode/settings.json`:

```json
{
  "editor.defaultFormatter": "esbenp.prettier-vscode",
  "editor.formatOnSave": true,
  "editor.codeActionsOnSave": {
    "source.fixAll.eslint": "explicit"
  },
  "tailwindCSS.experimental.classRegex": [
    ["clsx\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"],
    ["cn\\(([^)]*)\\)", "(?:'|\"|`)([^']*)(?:'|\"|`)"]
  ],
  "typescript.tsdk": "node_modules/typescript/lib",
  "typescript.enablePromptUseWorkspaceTsdk": true
}
```

### Workspace Snippets

Create `.vscode/snippets.json` for common patterns:

```json
{
  "Next.js Page Component": {
    "prefix": "npage",
    "body": [
      "export default function ${1:Page}() {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  );",
      "}"
    ]
  },
  "Client Component": {
    "prefix": "ncc",
    "body": [
      "\"use client\";",
      "",
      "export function ${1:Component}() {",
      "  return (",
      "    <div>",
      "      $0",
      "    </div>",
      "  );",
      "}"
    ]
  }
}
```

---

## Git Configuration

### Initialize Git Repository

```bash
# If not already initialized
git init

# Add remote
git remote add origin https://github.com/yourusername/your-app.git
```

### Recommended Git Hooks

Install pre-commit hook for linting:

```bash
# Create hooks directory
mkdir -p .husky

# Install husky
npm install --save-dev husky
npx husky init

# Add pre-commit hook
echo "npm run lint" > .husky/pre-commit
chmod +x .husky/pre-commit
```

### Git Ignore

Verify `.gitignore` includes:

```
# dependencies
/node_modules
/.pnp
.pnp.js

# next.js
/.next/
/out/

# production
/build

# local env files
.env*.local
.env

# firebase
.firebase/
firebase-debug.log
firestore-debug.log

# misc
.DS_Store
*.pem

# debug
npm-debug.log*

# typescript
*.tsbuildinfo
next-env.d.ts

# vercel
.vercel
```

---

## Development Workflow

### Typical Development Session

```bash
# 1. Pull latest changes
git pull origin main

# 2. Install any new dependencies
npm install

# 3. Start emulators (optional)
firebase emulators:start

# 4. Start dev server (in new terminal)
npm run dev

# 5. Make changes and test at http://localhost:3000

# 6. Lint and format
npm run lint
# Auto-fix if needed
npm run lint -- --fix

# 7. Commit changes
git add .
git commit -m "Your commit message"

# 8. Push to remote
git push origin your-branch
```

### Hot Reload

Next.js supports hot module replacement (HMR):

- **Component changes**: Automatically reload without losing state
- **CSS changes**: Update instantly
- **Configuration changes**: Require server restart

**To restart server:**
- Press `Ctrl+C` to stop
- Run `npm run dev` again

---

## Troubleshooting

### Port Already in Use

```bash
# Find process using port 3000
lsof -i :3000

# Kill process
kill -9 <PID>

# Or use different port
npm run dev -- -p 3001
```

### Firebase Auth Not Working Locally

**Issue:** Google OAuth popup blocked

**Solution:** Add `http://localhost:3000` to Firebase authorized domains:
1. Go to Firebase Console → Authentication → Settings → Authorized domains
2. Add `localhost`

### Module Not Found Errors

```bash
# Clear cache and reinstall
rm -rf node_modules .next
npm install
```

### TypeScript Errors After Update

```bash
# Regenerate Next.js types
rm -rf .next
npm run dev
# Let it build once, then stop
```

### Slow Build Times

**Enable Turbopack:**
```json
// package.json
"scripts": {
  "dev": "next dev --turbopack"
}
```

**Clear cache:**
```bash
rm -rf .next
npm run dev
```

### Environment Variables Not Loading

**Check:**
1. File is named exactly `.env.local` (not `.env.local.txt`)
2. Variables start with `NEXT_PUBLIC_` for client-side access
3. Restart dev server after adding/changing variables
4. Variables are not quoted (wrong: `VAR="value"`, right: `VAR=value`)

---

## Testing Your Setup

### Verify Everything Works

1. **Start dev server:**
   ```bash
   npm run dev
   ```
   ✅ Server starts without errors

2. **Access homepage:**
   - Open http://localhost:3000
   ✅ Page loads and displays correctly

3. **Check hot reload:**
   - Edit a component file
   - Save changes
   ✅ Page updates automatically

4. **Test authentication:**
   - Click sign in button
   - Try Google auth
   ✅ Auth flow works (or shows proper error if not configured)

5. **Check console:**
   - Open browser DevTools (F12)
   - Look at Console tab
   ✅ No critical errors (warnings about Firebase config are okay if not set up yet)

6. **Build for production:**
   ```bash
   npm run build
   ```
   ✅ Build completes successfully

---

## Next Steps

- [Firebase Setup →](./firebase-setup.md) - Configure Firebase for authentication and database
- [Environment Variables →](./environment-variables.md) - Complete list of environment variables
- [Vercel Deployment →](./vercel-deployment.md) - Deploy to production

---

## Quick Reference

**Essential Commands:**
```bash
npm install              # Install dependencies
npm run dev              # Start dev server
npm run build            # Build for production
npm run start            # Start production server
npm run lint             # Run ESLint
firebase emulators:start # Start Firebase emulators
firebase login           # Login to Firebase
```

**Key Files:**
- `.env.local` - Environment variables (create this)
- `package.json` - Dependencies and scripts
- `next.config.ts` - Next.js configuration
- `tailwind.config.ts` - Tailwind configuration
- `tsconfig.json` - TypeScript configuration

**Key Directories:**
- `src/app/` - Next.js pages and routes
- `src/components/` - React components
- `src/lib/` - Utilities, types, constants
- `public/` - Static assets

---

**Need Help?**
- Check [Dependencies →](../dependencies.md) for package reference
- See [Project Structure →](../project-structure.md) for file organization
- Review [Troubleshooting](#troubleshooting) section above
