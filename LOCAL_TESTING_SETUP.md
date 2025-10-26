# Local Testing Setup Guide

## 🏠 Testing Locally with Custom Domains

This guide explains how to test AINexSuite locally using domain names that match the production structure.

---

## Quick Start (No Configuration Needed!)

Modern browsers support `.localhost` subdomains automatically. Just add the port numbers:

```
✅ http://www.localhost:3010      - Main Dashboard
✅ http://notes.localhost:3001    - Notes App
✅ http://journal.localhost:3002  - Journal App
✅ http://todo.localhost:3003     - Todo App
✅ http://track.localhost:3004    - Track App
✅ http://moments.localhost:3005  - Moments App
✅ http://grow.localhost:3006     - Grow App
✅ http://pulse.localhost:3007    - Pulse App
✅ http://fit.localhost:3008      - Fit App
```

**Try it now**:
```bash
# Start the servers
pnpm dev

# Open in browser
open http://notes.localhost:3001
```

---

## Custom Domain Setup (Optional)

If you want to use `.local` or `.dev` domains, you need to configure your `/etc/hosts` file.

### Step 1: Edit /etc/hosts

```bash
# Open hosts file with sudo
sudo nano /etc/hosts
```

### Step 2: Add Local Domains

Add these lines to the file:

```
# AINexSuite Local Development
127.0.0.1 ainex.local
127.0.0.1 www.ainex.local
127.0.0.1 notes.ainex.local
127.0.0.1 journal.ainex.local
127.0.0.1 todo.ainex.local
127.0.0.1 track.ainex.local
127.0.0.1 moments.ainex.local
127.0.0.1 grow.ainex.local
127.0.0.1 pulse.ainex.local
127.0.0.1 fit.ainex.local
```

### Step 3: Save and Flush DNS

```bash
# Save the file (Ctrl+O, Enter, Ctrl+X in nano)

# Flush DNS cache (macOS)
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Verify it works
ping notes.ainex.local
# Should show: 127.0.0.1
```

### Step 4: Access Your Apps

```
http://www.ainex.local:3010      - Main Dashboard
http://notes.ainex.local:3001    - Notes App
http://journal.ainex.local:3002  - Journal App
http://todo.ainex.local:3003     - Todo App
http://track.ainex.local:3004    - Track App
http://moments.ainex.local:3005  - Moments App
http://grow.ainex.local:3006     - Grow App
http://pulse.ainex.local:3007    - Pulse App
http://fit.ainex.local:3008      - Fit App
```

---

## 🔒 SSL/HTTPS for Local Development (Optional)

If you need HTTPS locally (for testing secure features):

### Option 1: mkcert (Recommended)

```bash
# Install mkcert
brew install mkcert

# Install local CA
mkcert -install

# Generate certificates
cd /Users/dino/ainex/ainexsuite
mkdir -p .ssl

# Generate cert for all domains
mkcert -key-file .ssl/key.pem -cert-file .ssl/cert.pem \
  "*.ainex.local" \
  "*.localhost" \
  localhost \
  127.0.0.1

echo "Certificates created in .ssl/"
```

### Option 2: Update Next.js Config

Create or update `apps/main/server.js`:

```javascript
const { createServer } = require('https');
const { parse } = require('url');
const next = require('next');
const fs = require('fs');
const path = require('path');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

const httpsOptions = {
  key: fs.readFileSync(path.join(__dirname, '../../.ssl/key.pem')),
  cert: fs.readFileSync(path.join(__dirname, '../../.ssl/cert.pem'))
};

app.prepare().then(() => {
  createServer(httpsOptions, (req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3010, (err) => {
    if (err) throw err;
    console.log('> Ready on https://www.ainex.local:3010');
  });
});
```

Update `package.json`:

```json
{
  "scripts": {
    "dev": "node server.js",
    "dev:http": "next dev -p 3010"
  }
}
```

---

## 🍪 Testing SSO Cookies Locally

To test the Single Sign-On (SSO) session cookies that work across subdomains:

### Update Firebase Config for Local

Edit `packages/firebase/src/client.ts`:

```typescript
// For local testing with .ainex.local domains
export const sessionCookieDomain = process.env.NODE_ENV === 'production'
  ? '.ainexsuite.com'
  : '.ainex.local';
```

### Update Cookie Settings

When setting session cookies, use the local domain:

```typescript
// In your auth code
document.cookie = `session=${token}; domain=.ainex.local; path=/; max-age=3600`;
```

This allows cookies to be shared across:
- `www.ainex.local:3010`
- `notes.ainex.local:3001`
- `journal.ainex.local:3002`
- etc.

---

## 🧪 Testing Checklist

### Basic Local Testing
- [ ] All apps start on their respective ports
- [ ] Can access apps via `localhost:PORT`
- [ ] Can access apps via `*.localhost:PORT`
- [ ] Firebase auth works locally
- [ ] Firestore reads/writes work

### Domain Testing
- [ ] Can access via custom domains (if configured)
- [ ] DNS resolves correctly (`ping notes.ainex.local`)
- [ ] All apps load without CORS errors

### SSO Testing
- [ ] Login on main dashboard
- [ ] Navigate to notes app
- [ ] Still authenticated (no re-login needed)
- [ ] Session cookie visible in DevTools
- [ ] Cookie domain is correct (`.ainex.local` or `.localhost`)

### HTTPS Testing (if configured)
- [ ] Certificates are trusted
- [ ] No SSL warnings in browser
- [ ] Secure cookies work
- [ ] Service workers can be tested

---

## 🐛 Troubleshooting

### Issue: "This site can't be reached"

**Cause**: Domain not resolving

**Solution**:
```bash
# Check if domain is in hosts file
cat /etc/hosts | grep ainex

# Flush DNS
sudo dscacheutil -flushcache
sudo killall -HUP mDNSResponder

# Test resolution
ping notes.ainex.local
```

### Issue: "ERR_SSL_PROTOCOL_ERROR"

**Cause**: HTTPS not configured properly

**Solution**:
- Use HTTP instead (`http://` not `https://`)
- Or properly configure mkcert certificates

### Issue: "Session not shared across apps"

**Cause**: Cookie domain mismatch

**Solution**:
1. Check cookie domain in DevTools (Application → Cookies)
2. Should be `.ainex.local` or `.localhost`
3. Update cookie setting code to use correct domain

### Issue: CORS errors

**Cause**: Mismatched origins

**Solution**:
Update Next.js config to allow local domains:

```javascript
// next.config.js
module.exports = {
  async headers() {
    return [
      {
        source: '/api/:path*',
        headers: [
          { key: 'Access-Control-Allow-Origin', value: '*.ainex.local:*' },
          { key: 'Access-Control-Allow-Methods', value: 'GET,POST,PUT,DELETE' },
        ],
      },
    ];
  },
};
```

---

## 📝 Quick Reference

### Development URLs

| App | Port | localhost | .localhost | .local (custom) |
|-----|------|-----------|-----------|-----------------|
| Main | 3010 | localhost:3010 | www.localhost:3010 | www.ainex.local:3010 |
| Notes | 3001 | localhost:3001 | notes.localhost:3001 | notes.ainex.local:3001 |
| Journal | 3002 | localhost:3002 | journal.localhost:3002 | journal.ainex.local:3002 |
| Todo | 3003 | localhost:3003 | todo.localhost:3003 | todo.ainex.local:3003 |
| Track | 3004 | localhost:3004 | track.localhost:3004 | track.ainex.local:3004 |
| Moments | 3005 | localhost:3005 | moments.localhost:3005 | moments.ainex.local:3005 |
| Grow | 3006 | localhost:3006 | grow.localhost:3006 | grow.ainex.local:3006 |
| Pulse | 3007 | localhost:3007 | pulse.localhost:3007 | pulse.ainex.local:3007 |
| Fit | 3008 | localhost:3008 | fit.localhost:3008 | fit.ainex.local:3008 |

### Commands

```bash
# Start all apps
pnpm dev

# Start specific app
pnpm dev:notes

# Check running servers
lsof -i :3001

# View hosts file
cat /etc/hosts

# Flush DNS (macOS)
sudo dscacheutil -flushcache && sudo killall -HUP mDNSResponder

# Test domain resolution
ping notes.ainex.local
```

---

## 🚀 Production URLs (for reference)

When deployed to production:

```
https://www.ainexsuite.com      - Main Dashboard
https://notes.ainexsuite.com    - Notes App
https://journal.ainexsuite.com  - Journal App
https://todo.ainexsuite.com     - Todo App
https://track.ainexsuite.com    - Track App
https://moments.ainexsuite.com  - Moments App
https://grow.ainexsuite.com     - Grow App
https://pulse.ainexsuite.com    - Pulse App
https://fit.ainexsuite.com      - Fit App
```

All production URLs use HTTPS and share session cookies across the `.ainexsuite.com` domain.

---

**Recommendation**: For most local testing, just use `*.localhost:PORT` - it works immediately without any configuration!
