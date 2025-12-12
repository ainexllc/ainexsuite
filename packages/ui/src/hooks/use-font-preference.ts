"use client";

import { useEffect } from "react";
import type { FontFamily } from "@ainexsuite/types";

/**
 * Hook to apply user's font preference to the document.
 * Sets a data-font attribute on the html element which CSS uses to switch fonts.
 *
 * @param fontFamily - The user's selected font family preference
 */
export function useFontPreference(fontFamily?: FontFamily | null) {
  useEffect(() => {
    const font = fontFamily || "plus-jakarta-sans";
    document.documentElement.setAttribute("data-font", font);
  }, [fontFamily]);
}
