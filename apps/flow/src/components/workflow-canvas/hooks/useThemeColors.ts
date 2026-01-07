import { useState, useEffect } from 'react';

interface ThemeColors {
  themePrimary: string;
  themePrimaryRgb: string;
  themePrimaryLight: string;
}

/**
 * Hook to track theme colors from CSS variables set by AppColorProvider.
 * Watches for changes to document.documentElement style attribute.
 */
export function useThemeColors(): ThemeColors {
  const [themePrimary, setThemePrimary] = useState('#06b6d4');
  const [themePrimaryRgb, setThemePrimaryRgb] = useState('6, 182, 212');
  const [themePrimaryLight, setThemePrimaryLight] = useState('#22d3ee');

  useEffect(() => {
    const updateThemeColors = () => {
      const root = document.documentElement;
      const primary = getComputedStyle(root).getPropertyValue('--theme-primary').trim() || '#06b6d4';
      const primaryRgb = getComputedStyle(root).getPropertyValue('--theme-primary-rgb').trim() || '6, 182, 212';
      const primaryLight = getComputedStyle(root).getPropertyValue('--theme-primary-light').trim() || '#22d3ee';

      setThemePrimary(primary);
      setThemePrimaryRgb(primaryRgb);
      setThemePrimaryLight(primaryLight);
    };

    updateThemeColors();

    // Watch for CSS variable changes
    const observer = new MutationObserver(updateThemeColors);
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['style']
    });

    return () => observer.disconnect();
  }, []);

  return { themePrimary, themePrimaryRgb, themePrimaryLight };
}
