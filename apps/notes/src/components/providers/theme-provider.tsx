'use client';

// Re-export useTheme from @ainexsuite/theme (which wraps next-themes) to avoid direct dependency on next-themes
export { useTheme } from '@ainexsuite/theme';

// Deprecated local provider - now handled by root layout via @ainexsuite/theme
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}