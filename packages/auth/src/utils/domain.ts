/**
 * Cookie domain detection utility
 * Ensures consistent cookie domain between client and server
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

  // Production subdomains: detect which domain family
  if (host.includes('ainexspace.com')) {
    return '.ainexspace.com';
  }

  if (host.includes('ainexnotes.com')) {
    return '.ainexnotes.com';
  }

  if (host.includes('ainexjournal.com')) {
    return '.ainexjournal.com';
  }

  if (host.includes('ainexfit.com')) {
    return '.ainexfit.com';
  }

  if (host.includes('ainexhabits.com')) {
    return '.ainexhabits.com';
  }

  if (host.includes('ainexdisplay.com')) {
    return '.ainexdisplay.com';
  }

  if (host.includes('ainexalbum.com')) {
    return '.ainexalbum.com';
  }

  if (host.includes('ainextrack.com')) {
    return '.ainextrack.com';
  }

  if (host.includes('ainexproject.com')) {
    return '.ainexproject.com';
  }

  if (host.includes('ainexworkflow.com')) {
    return '.ainexworkflow.com';
  }

  if (host.includes('ainextodo.com')) {
    return '.ainextodo.com';
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
