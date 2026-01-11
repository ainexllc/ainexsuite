/**
 * Cookie domain detection utility
 * Ensures consistent cookie domain between client and server
 *
 * All apps use *.ainexspace.com subdomains for SSO
 */

/**
 * Detects the appropriate cookie domain based on the current hostname
 * Works in both browser (client-side) and Node.js (server-side) environments
 *
 * @param hostname - Optional hostname override (useful for server-side)
 * @returns Cookie domain string (e.g., '.ainexspace.com', '.localhost')
 */
export function getCookieDomain(hostname?: string): string {
  // Get hostname from window or parameter
  const host = hostname || (typeof window !== 'undefined' ? window.location.hostname : 'localhost');

  // Development: localhost
  if (host === 'localhost' || host === '127.0.0.1') {
    return '.localhost';
  }

  // Production: all apps use *.ainexspace.com subdomains
  if (host.includes('ainexspace.com')) {
    return '.ainexspace.com';
  }

  // Vercel preview deployments
  if (host.includes('vercel.app')) {
    return host;
  }

  // Fallback: use the hostname as-is
  return host;
}

/**
 * Check if the current environment supports cross-subdomain cookies
 * (i.e., using .ainexspace.com domain)
 */
export function supportsCrossSubdomainCookies(): boolean {
  const domain = getCookieDomain();
  return domain === '.ainexspace.com';
}
