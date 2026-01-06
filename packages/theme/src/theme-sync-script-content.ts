export type ResolvedTheme = 'light' | 'dark';

/**
 * Inline script that syncs cookie → localStorage AND applies theme class immediately.
 * This must be placed in <head> to run before body scripts.
 *
 * This prevents any flash by:
 * 1. Reading theme from cookie (shared across all *.ainexspace.com apps)
 * 2. Syncing to localStorage for next-themes
 * 3. Immediately applying the theme class to <html> element
 */
export const themeSyncScriptContent = `
(function(){
  try {
    var COOKIE = 'ainex-theme';
    var c = document.cookie.match(new RegExp('(^| )' + COOKIE + '=([^;]+)'));
    var theme = c ? c[2] : null;

    // Fallback to localStorage if no cookie
    if (!theme) {
      theme = localStorage.getItem(COOKIE);
    }

    // Apply theme immediately to prevent flash
    if (theme === 'light' || theme === 'dark') {
      document.documentElement.classList.remove('light', 'dark');
      document.documentElement.classList.add(theme);
      document.documentElement.style.colorScheme = theme;
      localStorage.setItem(COOKIE, theme);
    }
  } catch(e) {}
})();
`;
