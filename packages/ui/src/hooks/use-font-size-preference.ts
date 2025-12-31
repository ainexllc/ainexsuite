"use client";

import { useEffect } from "react";

type FontSize = 'sm' | 'md' | 'lg';

/**
 * Hook to apply user's font size preference to the document.
 * Sets a data-font-size attribute on the html element which CSS uses to scale fonts.
 *
 * @param fontSize - The user's selected font size preference ('sm' | 'md' | 'lg')
 */
export function useFontSizePreference(fontSize?: FontSize | null) {
  useEffect(() => {
    const size = fontSize || "md";
    document.documentElement.setAttribute("data-font-size", size);
  }, [fontSize]);
}
