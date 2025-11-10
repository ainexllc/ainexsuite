# DNS Configuration Guide for AinexSuite Multi-App Deployment

## Overview
This document provides complete DNS configuration for all AinexSuite apps with dual-domain support (subdomain + standalone domain).

---

## Domain Architecture

### Primary Domain: ainexsuite.com
All apps accessible via subdomains:
- `www.ainexsuite.com` → Main dashboard
- `notes.ainexsuite.com` → Notes app
- `journey.ainexsuite.com` → Journey/Journal app
- `todo.ainexsuite.com` → Todo app
- `track.ainexsuite.com` → Habit tracking (Phase 2)
- `moments.ainexsuite.com` → Photo memories (Phase 2)
- `grow.ainexsuite.com` → Growth tracking (Phase 2)
- `pulse.ainexsuite.com` → Health metrics (Phase 2)
- `fit.ainexsuite.com` → Fitness tracking (Phase 2)

### Standalone Domains
Each app also has its own domain:
- `ainexnotes.com` → Notes app
- `ainexjourney.com` → Journey app
- `ainextodo.com` → Todo app
- `ainextrack.com` → Habit tracking (Phase 2)
- `ainexmoments.com` → Photo memories (Phase 2)
- `ainexgrow.com` → Growth tracking (Phase 2)
- `ainexpulse.com` → Health metrics (Phase 2)
- `ainexfit.com` → Fitness tracking (Phase 2)

---

## Phase 1: Configure ainexsuite.com

### DNS Records for ainexsuite.com

Add these records to your DNS provider (e.g., Cloudflare, GoDaddy, Namecheap):

| Type | Name | Value | TTL | Priority | Notes |
|------|------|-------|-----|----------|-------|
| A | @ | 76.76.21.21 | Auto | - | Vercel IP for root domain |
| CNAME | www | cname.vercel-dns.com | Auto | - | Main dashboard |
| CNAME | notes | cname.vercel-dns.com | Auto | - | Notes app subdomain |
| CNAME | journey | cname.vercel-dns.com | Auto | - | Journey app subdomain |
| CNAME | todo | cname.vercel-dns.com | Auto | - | Todo app subdomain |

### Future Subdomains (Phase 2)

| Type | Name | Value | TTL | Priority | Notes |
|------|------|-------|-----|----------|-------|
| CNAME | track | cname.vercel-dns.com | Auto | - | Habit tracking |
| CNAME | moments | cname.vercel-dns.com | Auto | - | Photo memories |
| CNAME | grow | cname.vercel-dns.com | Auto | - | Growth tracking |
| CNAME | pulse | cname.vercel-dns.com | Auto | - | Health metrics |
| CNAME | fit | cname.vercel-dns.com | Auto | - | Fitness tracking |

---

## Phase 2: Configure Standalone Domains

### ainexnotes.com

| Type | Name | Value | TTL | Priority | Notes |
|------|------|-------|-----|----------|-------|
| A | @ | 76.76.21.21 | Auto | - | Root domain |
| CNAME | www | cname.vercel-dns.com | Auto | - | WWW redirect |

### ainexjourney.com

| Type | Name | Value | TTL | Priority | Notes |
|------|------|-------|-----|----------|-------|
| A | @ | 76.76.21.21 | Auto | - | Root domain |
| CNAME | www | cname.vercel-dns.com | Auto | - | WWW redirect |

### ainextodo.com

| Type | Name | Value | TTL | Priority | Notes |
|------|------|-------|-----|----------|-------|
| A | @ | 76.76.21.21 | Auto | - | Root domain |
| CNAME | www | cname.vercel-dns.com | Auto | - | WWW redirect |

### Future Standalone Domains (Phase 2)

Repeat the same pattern for:
- `ainextrack.com`
- `ainexmoments.com`
- `ainexgrow.com`
- `ainexpulse.com`
- `ainexfit.com`

---

## DNS Provider-Specific Instructions

### Cloudflare

1. Log in to https://dash.cloudflare.com
2. Select your domain (e.g., `ainexsuite.com`)
3. Go to **DNS** → **Records**
4. Click **Add record**
5. Enter the values from the tables above
6. **Important**: Set Proxy status to **DNS only** (gray cloud) for CNAME records pointing to Vercel
7. Click **Save**

**Recommended Settings**:
- SSL/TLS Mode: **Full (strict)**
- Always Use HTTPS: **On**
- Auto Minify: **On** (HTML, CSS, JS)
- Brotli Compression: **On**

### GoDaddy

1. Log in to https://dcc.godaddy.com
2. Go to **My Products** → **Domains**
3. Click **DNS** next to your domain
4. Click **Add** to create new records
5. Enter the values from the tables above
6. Click **Save**

**Note**: GoDaddy may take 24-48 hours for DNS propagation

### Namecheap

1. Log in to https://www.namecheap.com
2. Go to **Domain List**
3. Click **Manage** next to your domain
4. Go to **Advanced DNS** tab
5. Click **Add New Record**
6. Enter the values from the tables above
7. Click **Save All Changes**

---

## Verification Steps

### 1. Check DNS Propagation

Use these tools to verify DNS records are propagating:

```bash
# Check A record
dig ainexsuite.com A

# Check CNAME records
dig www.ainexsuite.com CNAME
dig notes.ainexsuite.com CNAME
dig journey.ainexsuite.com CNAME
dig todo.ainexsuite.com CNAME

# Check from multiple locations
https://dnschecker.org
```

### 2. Verify in Vercel Dashboard

For each Vercel project:
1. Go to **Settings** → **Domains**
2. Check that domains show **Valid** status
3. Click domain to see detailed status
4. Verify SSL certificate is **Active**

### 3. Test Domain Resolution

```bash
# Test all domains resolve
curl -I https://www.ainexsuite.com
curl -I https://notes.ainexsuite.com
curl -I https://journey.ainexsuite.com
curl -I https://todo.ainexsuite.com
curl -I https://ainexnotes.com
curl -I https://ainexjourney.com
curl -I https://ainextodo.com
```

Expected: All should return `HTTP/2 200` or `HTTP/2 301` (redirect to HTTPS)

---

## Troubleshooting

### DNS Not Resolving

**Issue**: Domain doesn't resolve or shows "DNS_PROBE_FINISHED_NXDOMAIN"

**Solutions**:
1. Wait 24-48 hours for full DNS propagation
2. Flush your local DNS cache:
   ```bash
   # macOS
   sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder

   # Windows
   ipconfig /flushdns

   # Linux
   sudo systemd-resolve --flush-caches
   ```
3. Use `8.8.8.8` (Google DNS) or `1.1.1.1` (Cloudflare DNS) temporarily
4. Verify records in DNS provider dashboard

### SSL Certificate Issues

**Issue**: "Your connection is not private" or SSL error

**Solutions**:
1. Wait 5-10 minutes for Vercel to provision SSL certificate
2. Verify domain is added correctly in Vercel project
3. Check DNS records point to `cname.vercel-dns.com`
4. Remove and re-add domain in Vercel if needed
5. Ensure Cloudflare proxy is **disabled** (DNS only) for CNAME records

### Domain Shows Wrong App

**Issue**: Domain loads incorrect app or Vercel 404 page

**Solutions**:
1. Verify domain is added to **correct** Vercel project
2. Check Root Directory is set correctly in project settings
3. Verify deployment was successful
4. Clear browser cache and try incognito mode

### Subdomain Not Working

**Issue**: Subdomain doesn't resolve but main domain works

**Solutions**:
1. Verify CNAME record exists for subdomain
2. Check TTL hasn't cached old value (wait for TTL to expire)
3. Verify subdomain is added to Vercel project
4. Test with different DNS server (`dig @8.8.8.8 notes.ainexsuite.com`)

---

## DNS Propagation Timeline

| Action | Typical Time |
|--------|-------------|
| Add new DNS record | 5-10 minutes |
| Update existing record | 1-2 hours |
| Change nameservers | 24-48 hours |
| Full global propagation | Up to 72 hours |

**Note**: Most modern DNS providers propagate much faster (minutes to hours), but RFC standards allow up to 72 hours.

---

## Security Best Practices

### 1. Enable DNSSEC

If your DNS provider supports it, enable DNSSEC to prevent DNS spoofing:
1. Go to DNS settings
2. Enable DNSSEC
3. Add DS records to domain registrar

### 2. Set Appropriate TTLs

- **Production domains**: 3600 (1 hour) or higher
- **Development/testing**: 300 (5 minutes) for faster updates
- **Before migration**: Lower TTL 24 hours in advance

### 3. Use CAA Records

Add Certification Authority Authorization records to specify which CAs can issue certificates:

| Type | Name | Value | TTL |
|------|------|-------|-----|
| CAA | @ | 0 issue "letsencrypt.org" | Auto |
| CAA | @ | 0 issue "pki.goog" | Auto |

---

## Monitoring

### Recommended Tools

1. **Uptime Monitoring**:
   - https://uptimerobot.com
   - https://statuspage.io

2. **DNS Monitoring**:
   - https://dnsspy.io
   - https://dnschecker.org

3. **SSL Monitoring**:
   - https://www.ssllabs.com/ssltest/
   - https://observatory.mozilla.org

---

## Reference

- **Vercel DNS**: `cname.vercel-dns.com`
- **Vercel IP**: `76.76.21.21` (for A records)
- **DNS Checker**: https://dnschecker.org
- **Vercel Domains Guide**: https://vercel.com/docs/projects/domains
