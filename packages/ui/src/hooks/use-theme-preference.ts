"use client";

import { useEffect } from "react";
import { useTheme } from "next-themes";

/**
 * Hook to sync user's theme preference from Firestore to next-themes.
 * Call this in your app's root layout or shell component.
 *
 * @param themePreference - The user's saved theme preference from Firestore ('light' | 'dark' | 'system')
 */
export function useThemePreference(themePreference?: "light" | "dark" | "system" | null) {
  const { setTheme, theme: currentTheme } = useTheme();

  useEffect(() => {
    // Only sync if we have a saved preference and it differs from current
    if (themePreference && themePreference !== currentTheme) {
      setTheme(themePreference);
    }
  }, [themePreference, currentTheme, setTheme]);
}
