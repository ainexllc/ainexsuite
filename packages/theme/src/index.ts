// src/index.ts
export { ThemeProvider, useThemeChangeCallback } from './provider';
export type { ExtendedThemeProviderProps } from './provider';
export { ThemeToggle } from './toggle';
export { useTheme } from './use-theme';
export { AppColorProvider, useAppColors, useAppTheme } from './app-color-provider';
export type { BackgroundVariant } from './app-color-provider';
export { useAllAppColors } from './use-all-app-colors';
export { ThemeSyncScript } from './theme-sync-script';
export {
  getThemeCookie,
  setThemeCookie,
  removeThemeCookie,
  parseThemeFromCookieHeader,
  resolveThemeClass,
  THEME_COOKIE_NAME,
  THEME_COOKIE_MAX_AGE,
  type ThemeValue,
} from './theme-cookie';
// Server-only exports - import from '@ainexsuite/theme/server' instead
export { themeSyncScriptContent } from './theme-sync-script-content';
export type { ResolvedTheme } from './theme-sync-script-content';
