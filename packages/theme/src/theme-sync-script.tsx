/**
 * Theme Sync Script Component
 *
 * Uses a direct inline script to ensure this runs BEFORE next-themes initializes.
 * This MUST be placed in the <head> tag, before the body renders.
 *
 * Why inline script (not Next.js Script)?
 * - Next.js Script with beforeInteractive still runs AFTER inline scripts
 * - next-themes uses an inline script, so we need to run before it
 * - This ensures cookie → localStorage sync happens first
 *
 * Why cookies?
 * - localStorage is per-origin (different ports = different storage)
 * - Cookies are shared across all ports on localhost
 * - This enables cross-app theme sync in development
 *
 * @example
 * ```tsx
 * // In your app's layout.tsx:
 * <html>
 *   <head>
 *     <ThemeSyncScript />
 *   </head>
 *   <body>
 *     <ThemeProvider>...</ThemeProvider>
 *   </body>
 * </html>
 * ```
 */
export function ThemeSyncScript() {
  return (
    <script
      dangerouslySetInnerHTML={{
        __html: `
(function() {
  try {
    var COOKIE_NAME = 'ainex-theme';
    var STORAGE_KEY = 'ainex-theme';

    // Read theme from cookie
    var match = document.cookie.match(new RegExp('(^| )' + COOKIE_NAME + '=([^;]+)'));
    var cookieTheme = match ? match[2] : null;

    // Read theme from localStorage
    var storageTheme = null;
    try {
      storageTheme = localStorage.getItem(STORAGE_KEY);
    } catch (e) {}

    console.log('[ThemeSync] Cookie:', cookieTheme, 'Storage:', storageTheme);

    // Cookie takes priority (it's the cross-app source of truth)
    if (cookieTheme && cookieTheme !== storageTheme) {
      try {
        localStorage.setItem(STORAGE_KEY, cookieTheme);
        console.log('[ThemeSync] Synced cookie to localStorage:', cookieTheme);
      } catch (e) {}
    }
    // If localStorage exists but cookie doesn't, set the cookie
    else if (storageTheme && !cookieTheme) {
      var domain = window.location.hostname.includes('ainexsuite.com')
        ? '; domain=.ainexsuite.com' : '';
      document.cookie = COOKIE_NAME + '=' + storageTheme + '; path=/; max-age=31536000; SameSite=Lax' + domain;
      console.log('[ThemeSync] Synced localStorage to cookie:', storageTheme);
    }
  } catch (e) {
    console.error('[ThemeSync] Error:', e);
  }
})();
`,
      }}
    />
  );
}
