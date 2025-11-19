'use client';

// Re-export useTheme from next-themes to maintain compatibility with existing imports
export { useTheme } from 'next-themes';

// Deprecated local provider - now handled by root layout via @ainexsuite/theme
export function ThemeProvider({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}