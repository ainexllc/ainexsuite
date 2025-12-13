"use client";

import { ThemeProvider as NextThemesProvider, useTheme as useNextTheme } from "next-themes";
import type { ThemeProviderProps } from "next-themes";
import { useEffect, useRef, createContext, useContext } from "react";

const COOKIE_NAME = "ainex-theme";

// Simple cookie setter
function setCookie(theme: string) {
  document.cookie = `${COOKIE_NAME}=${theme}; path=/; max-age=31536000; SameSite=Lax`;
  console.log('[Theme] Cookie set:', theme);
}

// Context for theme change callback
type ThemeChangeCallback = (theme: 'light' | 'dark') => void;
const ThemeChangeContext = createContext<ThemeChangeCallback | null>(null);

// Sync theme to cookie whenever it changes
function ThemeCookieSync({ onThemeChange }: { onThemeChange?: ThemeChangeCallback }) {
  const { theme, resolvedTheme } = useNextTheme();
  const prevThemeRef = useRef<string | null>(null);

  useEffect(() => {
    // Write the resolved theme (light/dark) to cookie
    const themeToSave = resolvedTheme || theme;
    if (themeToSave && (themeToSave === 'light' || themeToSave === 'dark')) {
      setCookie(themeToSave);

      // Notify callback if theme actually changed (not just initial mount)
      if (prevThemeRef.current !== null && prevThemeRef.current !== themeToSave) {
        console.log('[Theme] Theme changed:', prevThemeRef.current, '->', themeToSave);
        onThemeChange?.(themeToSave as 'light' | 'dark');
      }
      prevThemeRef.current = themeToSave;
    }
  }, [theme, resolvedTheme, onThemeChange]);

  return null;
}

export interface ExtendedThemeProviderProps extends ThemeProviderProps {
  /** Callback fired when user changes theme (for Firestore sync) */
  onThemeChange?: ThemeChangeCallback;
}

export function ThemeProvider({ children, onThemeChange, ...props }: ExtendedThemeProviderProps) {
  return (
    <NextThemesProvider
      attribute="class"
      storageKey="ainex-theme"
      disableTransitionOnChange
      {...props}
    >
      <ThemeChangeContext.Provider value={onThemeChange || null}>
        <ThemeCookieSync onThemeChange={onThemeChange} />
        {children}
      </ThemeChangeContext.Provider>
    </NextThemesProvider>
  );
}

/** Hook to get the theme change callback (for custom theme controls) */
export function useThemeChangeCallback() {
  return useContext(ThemeChangeContext);
}
