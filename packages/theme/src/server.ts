// Server-only exports for App Router layouts
// Import this from '@ainexsuite/theme/server' in Server Components only

import { cookies } from 'next/headers';

export type ResolvedTheme = 'light' | 'dark';

/**
 * Read theme from cookie server-side.
 * This enables setting the correct theme class on <html> during SSR,
 * preventing any flash of incorrect theme.
 *
 * @returns The theme value from cookie, or 'dark' as default
 */
export async function getServerTheme(): Promise<ResolvedTheme> {
  try {
    const cookieStore = await cookies();
    const themeCookie = cookieStore.get('ainex-theme');
    const theme = themeCookie?.value;

    if (theme === 'light') {
      return 'light';
    }

    if (theme === 'dark') {
      return 'dark';
    }

    // For 'system' or missing, default to dark
    return 'dark';
  } catch {
    // cookies() might fail in some contexts
    return 'dark';
  }
}
