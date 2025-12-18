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
    if (theme) {
      localStorage.setItem(COOKIE, theme);
    }
  } catch(e) {}
})();
`;
