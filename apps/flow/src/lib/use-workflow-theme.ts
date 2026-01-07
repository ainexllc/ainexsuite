'use client';

import { useState, useEffect } from 'react';

/**
 * Hook to get theme colors from CSS variables set by AppColorProvider
 * Used by workflow canvas nodes and components
 */
export function useWorkflowTheme() {
  const [primary, setPrimary] = useState('#06b6d4');

  useEffect(() => {
    const updateColors = () => {
      const primaryColor = getComputedStyle(document.documentElement)
        .getPropertyValue('--theme-primary')
        .trim() || '#06b6d4';
      setPrimary(primaryColor);
    };

    updateColors();

    // Watch for CSS variable changes
    const observer = new MutationObserver(updateColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style'],
    });

    return () => observer.disconnect();
  }, []);

  return { primary };
}
