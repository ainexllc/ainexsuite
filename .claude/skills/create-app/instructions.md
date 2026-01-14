# create-app

Scaffold a new AinexSuite app with full configuration in one command.

## Usage

```
/create-app <app-name> [--port <port>] [--color <hex>] [--description <desc>]
```

**Examples:**

- `/create-app meals` - Create a meals tracking app
- `/create-app meals --port 3015 --color #f59e0b` - With custom port and color
- `/create-app meals --description "Meal planning and nutrition tracking"`

## Instructions

When the user invokes this skill:

### 1. Parse Arguments

Extract from user input:

- `appName` (required): lowercase, kebab-case app name
- `port` (optional): defaults to next available (3015+)
- `color` (optional): theme color hex, defaults to `#6366f1`
- `description` (optional): app description

### 2. Validate

- Check app name doesn't already exist in `apps/`
- Ensure port isn't already assigned to another app
- Validate color is valid hex format

### 3. Create Directory Structure

Create `apps/<app-name>/` with this structure:

```
apps/<app-name>/
  src/
    app/
      layout.tsx
      page.tsx
      globals.css
    components/
      .gitkeep
    hooks/
      .gitkeep
    lib/
      .gitkeep
  public/
    .gitkeep
  package.json
  tsconfig.json
  next.config.js
  tailwind.config.ts
  postcss.config.js
  vercel.json
  .env.example
```

### 4. File Templates

#### package.json

```json
{
  "name": "@ainexsuite/<app-name>",
  "version": "0.1.0",
  "private": true,
  "description": "<description>",
  "scripts": {
    "dev": "next dev --turbopack -H 0.0.0.0 -p ${PORT:-<port>}",
    "build": "next build",
    "start": "next start -p ${PORT:-<port>}",
    "lint": "eslint . --ext .ts,.tsx --max-warnings=0 --cache",
    "deploy": "vercel --prod"
  },
  "dependencies": {
    "@ainexsuite/auth": "workspace:*",
    "@ainexsuite/firebase": "workspace:*",
    "@ainexsuite/theme": "workspace:*",
    "@ainexsuite/types": "workspace:*",
    "@ainexsuite/ui": "workspace:*",
    "framer-motion": "^11.0.0",
    "lucide-react": "^0.312.0",
    "next": "15.5.9",
    "react": "^19.1.0",
    "react-dom": "^19.1.0"
  },
  "devDependencies": {
    "@ainexsuite/config": "workspace:*",
    "@types/node": "^20.11.0",
    "@types/react": "^19.1.0",
    "@types/react-dom": "^19.1.0",
    "autoprefixer": "^10.4.16",
    "eslint": "^8.56.0",
    "eslint-config-next": "^15.5.4",
    "postcss": "^8.4.33",
    "tailwindcss": "^3.4.1",
    "typescript": "^5.3.3"
  }
}
```

#### tsconfig.json

```json
{
  "extends": "../../packages/config/tsconfig.json",
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["next-env.d.ts", "**/*.ts", "**/*.tsx", ".next/types/**/*.ts"],
  "exclude": ["node_modules"]
}
```

#### next.config.js

```javascript
const {
  getSecurityHeaders,
} = require("@ainexsuite/config/next-security-headers");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,

  transpilePackages: [
    "@ainexsuite/ui",
    "@ainexsuite/firebase",
    "@ainexsuite/auth",
    "@ainexsuite/types",
    "@ainexsuite/theme",
  ],

  env: {
    NEXT_PUBLIC_APP_NAME: "<app-name>",
  },

  images: {
    remotePatterns: [
      { protocol: "https", hostname: "firebasestorage.googleapis.com" },
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },

  experimental: {
    optimizePackageImports: ["lucide-react"],
  },

  async headers() {
    return getSecurityHeaders();
  },
};

module.exports = nextConfig;
```

#### vercel.json

```json
{
  "$schema": "https://openapi.vercel.sh/vercel.json",
  "buildCommand": "cd ../.. && pnpm turbo run build --filter=@ainexsuite/<app-name> --force",
  "installCommand": "cd ../.. && pnpm install",
  "framework": "nextjs",
  "outputDirectory": ".next",
  "ignoreCommand": "cd ../.. && git diff --quiet HEAD^ HEAD -- ./apps/<app-name> ./packages ./package.json ./pnpm-lock.yaml ./turbo.json"
}
```

#### tailwind.config.ts

```typescript
import type { Config } from "tailwindcss";
import sharedConfig from "@ainexsuite/config/tailwind";

const config: Config = {
  presets: [sharedConfig],
  content: [
    "./src/pages/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/components/**/*.{js,ts,jsx,tsx,mdx}",
    "./src/app/**/*.{js,ts,jsx,tsx,mdx}",
    "../../packages/ui/src/**/*.{js,ts,jsx,tsx}",
    "../../packages/types/src/**/*.{ts,tsx}",
  ],
  plugins: [],
};

export default config;
```

#### postcss.config.js

```javascript
module.exports = {
  plugins: {
    tailwindcss: {},
    autoprefixer: {},
  },
};
```

#### src/app/layout.tsx

```tsx
import type { Metadata } from "next";
import { GeistSans } from "geist/font/sans";
import "./globals.css";

export const metadata: Metadata = {
  title: "<App Name> | AinexSpace",
  description: "<description>",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={GeistSans.className}>{children}</body>
    </html>
  );
}
```

#### src/app/page.tsx

```tsx
export default function Home() {
  return (
    <main className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <h1 className="text-4xl font-bold mb-4"><App Name></h1>
        <p className="text-muted-foreground">Welcome to your new app</p>
      </div>
    </main>
  );
}
```

#### src/app/globals.css

```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

#### .env.example

```
# Firebase Client
NEXT_PUBLIC_FIREBASE_API_KEY=
NEXT_PUBLIC_FIREBASE_AUTH_DOMAIN=
NEXT_PUBLIC_FIREBASE_PROJECT_ID=
NEXT_PUBLIC_FIREBASE_STORAGE_BUCKET=
NEXT_PUBLIC_FIREBASE_MESSAGING_SENDER_ID=
NEXT_PUBLIC_FIREBASE_APP_ID=

# Firebase Admin
FIREBASE_ADMIN_PROJECT_ID=
FIREBASE_ADMIN_CLIENT_EMAIL=
FIREBASE_ADMIN_PRIVATE_KEY=
```

### 5. Post-Creation Steps

After creating all files:

1. **Install dependencies:**

   ```bash
   cd /Users/dinohorn/ainex/ainexsuite && pnpm install
   ```

2. **Verify build:**

   ```bash
   pnpm turbo run build --filter=@ainexsuite/<app-name>
   ```

3. **Update CLAUDE.md** - Add app to the Apps table with port and description

4. **Inform user of next steps:**
   - Create Vercel project: `vercel link` in app directory
   - Set up environment variables in Vercel
   - Add domain: `<app-name>.ainexspace.com`

## App Reference (Current Apps)

| App      | Port | Color   |
| -------- | ---- | ------- |
| main     | 3000 | #f97316 |
| notes    | 3001 | #eab308 |
| journal  | 3002 | #f97316 |
| todo     | 3003 | #8b5cf6 |
| health   | 3004 | #10b981 |
| album    | 3005 | #ec4899 |
| habits   | 3006 | #14b8a6 |
| mosaic   | 3007 | #ef4444 |
| fit      | 3008 | #3b82f6 |
| projects | 3009 | #6366f1 |
| flow     | 3010 | #06b6d4 |
| subs     | 3011 | #10b981 |
| docs     | 3012 | #3b82f6 |
| tables   | 3013 | #10b981 |
| calendar | 3014 | #06b6d4 |
| admin    | 3020 | —       |

**Next available port:** 3015
