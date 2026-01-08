/**
 * App Prefetch Utility
 *
 * Prefetches app resources on hover to reduce perceived navigation time.
 * Uses browser hints to preconnect and prefetch before user clicks.
 *
 * Flow:
 * 1. User hovers over app icon (100ms debounce)
 * 2. DNS prefetch initiated
 * 3. TLS connection established (preconnect)
 * 4. Page HTML prefetched
 *
 * Savings: ~200ms reduction in navigation time
 */

import { getAppUrl, SUITE_APPS } from '../config/apps';

// Track which apps have been prefetched to avoid duplicates
const prefetchedApps = new Set<string>();

// Active debounce timers
const prefetchTimers = new Map<string, NodeJS.Timeout>();

/**
 * Get the URL for an app based on environment
 */
function getAppUrlForPrefetch(appSlug: string): string {
  const isDev = typeof process !== 'undefined' && process.env.NODE_ENV === 'development';
  // Get base URL without the /workspace path
  const fullUrl = getAppUrl(appSlug, isDev);
  // Remove /workspace suffix for prefetch (we want the base URL for connection hints)
  return fullUrl.replace('/workspace', '');
}

/**
 * Add a link element to the document head
 */
function addLinkHint(rel: string, href: string, as?: string): void {
  // Check if already exists
  const existing = document.querySelector(`link[rel="${rel}"][href="${href}"]`);
  if (existing) return;

  const link = document.createElement('link');
  link.rel = rel;
  link.href = href;
  if (as) link.setAttribute('as', as);

  // Add crossorigin for preconnect
  if (rel === 'preconnect' || rel === 'dns-prefetch') {
    link.crossOrigin = 'anonymous';
  }

  document.head.appendChild(link);
}

/**
 * Prefetch an app's resources
 * Called on hover to reduce navigation time
 */
export function prefetchApp(appSlug: string): void {
  // Skip if already prefetched
  if (prefetchedApps.has(appSlug)) {
    return;
  }

  // Skip if invalid app
  if (!SUITE_APPS[appSlug as keyof typeof SUITE_APPS]) {
    return;
  }

  const appUrl = getAppUrlForPrefetch(appSlug);

  try {
    // 1. DNS Prefetch - resolve domain name ahead of time
    addLinkHint('dns-prefetch', appUrl);

    // 2. Preconnect - establish connection (TCP + TLS)
    addLinkHint('preconnect', appUrl);

    // 3. Prefetch workspace page HTML
    const workspaceUrl = `${appUrl}/workspace`;
    addLinkHint('prefetch', workspaceUrl, 'document');

    // Mark as prefetched
    prefetchedApps.add(appSlug);

    console.log(`[Prefetch] Prefetched resources for ${appSlug}`);
  } catch (error) {
    console.error(`[Prefetch] Failed to prefetch ${appSlug}:`, error);
  }
}

/**
 * Debounced prefetch - waits 100ms of hover before prefetching
 * Prevents prefetching when user is just passing over the icon
 */
export function debouncedPrefetch(appSlug: string): void {
  // Clear any existing timer for this app
  const existingTimer = prefetchTimers.get(appSlug);
  if (existingTimer) {
    clearTimeout(existingTimer);
  }

  // Set new timer
  const timer = setTimeout(() => {
    prefetchApp(appSlug);
    prefetchTimers.delete(appSlug);
  }, 100);

  prefetchTimers.set(appSlug, timer);
}

/**
 * Cancel pending prefetch
 * Called when user moves mouse away before 100ms
 */
export function cancelPrefetch(appSlug: string): void {
  const timer = prefetchTimers.get(appSlug);
  if (timer) {
    clearTimeout(timer);
    prefetchTimers.delete(appSlug);
  }
}

/**
 * Prefetch all apps in the dock
 * Called after successful authentication to warm up connections
 */
export function prefetchAllApps(): void {
  const appSlugs = Object.keys(SUITE_APPS);

  // Stagger prefetches to avoid overwhelming the network
  appSlugs.forEach((slug, index) => {
    setTimeout(() => {
      prefetchApp(slug);
    }, index * 50); // 50ms between each
  });
}

/**
 * Check if an app has been prefetched
 */
export function isAppPrefetched(appSlug: string): boolean {
  return prefetchedApps.has(appSlug);
}

/**
 * Clear all prefetch state
 * Called on logout to reset for next session
 */
export function clearPrefetchState(): void {
  prefetchedApps.clear();

  // Clear all pending timers
  prefetchTimers.forEach((timer) => clearTimeout(timer));
  prefetchTimers.clear();
}
