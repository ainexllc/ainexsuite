/**
 * Theme Cookie Utility
 *
 * Provides cross-app theme persistence using cookies.
 * Cookies are shared across all ports on localhost (unlike localStorage),
 * making this perfect for multi-app suites.
 *
 * In production with subdomains, set domain=.ainexsuite.com
 */

export const THEME_COOKIE_NAME = 'ainex-theme';
export const THEME_COOKIE_MAX_AGE = 60 * 60 * 24 * 365; // 1 year

export type ThemeValue = 'light' | 'dark' | 'system';

/**
 * Get theme from cookie (client-side)
 */
export function getThemeCookie(): ThemeValue | null {
  if (typeof document === 'undefined') return null;

  const match = document.cookie.match(new RegExp(`(^| )${THEME_COOKIE_NAME}=([^;]+)`));
  if (match) {
    const value = match[2] as ThemeValue;
    if (['light', 'dark', 'system'].includes(value)) {
      return value;
    }
  }
  return null;
}

/**
 * Set theme cookie (client-side)
 * Works across all apps on localhost (dev) and subdomains (prod)
 */
export function setThemeCookie(theme: ThemeValue): void {
  if (typeof document === 'undefined') return;

  const isProduction = typeof window !== 'undefined' &&
    window.location.hostname.includes('ainexsuite.com');

  // In production, set domain for cross-subdomain sharing
  const domain = isProduction ? '; domain=.ainexsuite.com' : '';

  // SameSite=Lax allows the cookie to be sent with same-site requests
  // and top-level navigations (cross-app navigation)
  document.cookie = `${THEME_COOKIE_NAME}=${theme}; path=/; max-age=${THEME_COOKIE_MAX_AGE}; SameSite=Lax${domain}`;
}

/**
 * Remove theme cookie
 */
export function removeThemeCookie(): void {
  if (typeof document === 'undefined') return;

  const isProduction = typeof window !== 'undefined' &&
    window.location.hostname.includes('ainexsuite.com');

  const domain = isProduction ? '; domain=.ainexsuite.com' : '';

  document.cookie = `${THEME_COOKIE_NAME}=; path=/; max-age=0${domain}`;
}

/**
 * Parse theme from cookie header string (server-side)
 */
export function parseThemeFromCookieHeader(cookieHeader: string | null): ThemeValue | null {
  if (!cookieHeader) return null;

  const match = cookieHeader.match(new RegExp(`(^| )${THEME_COOKIE_NAME}=([^;]+)`));
  if (match) {
    const value = match[2] as ThemeValue;
    if (['light', 'dark', 'system'].includes(value)) {
      return value;
    }
  }
  return null;
}

/**
 * Resolve theme to actual class (handles 'system' preference)
 * Used server-side where we can't detect system preference
 */
export function resolveThemeClass(theme: ThemeValue | null): 'dark' | 'light' {
  // Default to dark for system/null since most users prefer dark mode
  // and it's better to flash to light than to flash to dark
  if (!theme || theme === 'system') {
    return 'dark';
  }
  return theme;
}
