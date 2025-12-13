export type ResolvedTheme = 'light' | 'dark';

/**
 * Inline script that syncs cookie → localStorage before next-themes reads it.
 * This must be placed in <head> to run before body scripts.
 */
export const themeSyncScriptContent = `
(function(){
  try {
    var COOKIE = 'ainex-theme';
    var c = document.cookie.match(new RegExp('(^| )' + COOKIE + '=([^;]+)'));
    var theme = c ? c[2] : null;
    var lsTheme = localStorage.getItem(COOKIE);
    console.log('[ThemeSync HEAD] Cookie:', theme, '| localStorage:', lsTheme);
    if (theme) {
      localStorage.setItem(COOKIE, theme);
      console.log('[ThemeSync HEAD] Synced cookie to localStorage:', theme);
    }
  } catch(e) {
    console.error('[ThemeSync]', e);
  }
})();
`;
