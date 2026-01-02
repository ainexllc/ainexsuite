'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';

export type BackgroundVariant = 'glow' | 'aurora' | 'minimal' | 'grid' | 'dots' | 'mesh';

interface AppTheme {
  primary: string;
  secondary: string;
  backgroundVariant: BackgroundVariant;
  backgroundIntensity: number;
  backgroundAccentColor: string;
  loading: boolean;
}

const AppColorContext = createContext<AppTheme>({
  primary: '#3b82f6',
  secondary: '#60a5fa',
  backgroundVariant: 'glow',
  backgroundIntensity: 0.25,
  backgroundAccentColor: '#f97316',
  loading: true,
});

export function useAppColors() {
  return useContext(AppColorContext);
}

export function useAppTheme() {
  return useContext(AppColorContext);
}

interface AppColorProviderProps {
  children: ReactNode;
  appId: string;
  fallbackPrimary?: string;
  fallbackSecondary?: string;
}

export function AppColorProvider({
  children,
  appId,
  fallbackPrimary = '#3b82f6',
  fallbackSecondary = '#60a5fa',
}: AppColorProviderProps) {
  const [theme, setTheme] = useState<AppTheme>({
    primary: fallbackPrimary,
    secondary: fallbackSecondary,
    backgroundVariant: 'glow',
    backgroundIntensity: 0.25,
    backgroundAccentColor: '#f97316',
    loading: true,
  });

  useEffect(() => {
    // Track loading states for both listeners
    let appColorsLoaded = false;
    let themeLoaded = false;
    let appColors = { primary: fallbackPrimary, secondary: fallbackSecondary };
    let globalTheme = { backgroundVariant: 'glow' as BackgroundVariant, backgroundIntensity: 0.25, backgroundAccentColor: '#f97316' };

    const updateTheme = () => {
      const isLoading = !appColorsLoaded || !themeLoaded;
      setTheme({
        primary: appColors.primary,
        secondary: appColors.secondary,
        backgroundVariant: globalTheme.backgroundVariant,
        backgroundIntensity: globalTheme.backgroundIntensity,
        backgroundAccentColor: globalTheme.backgroundAccentColor,
        loading: isLoading,
      });
    };

    // Listen to real-time color updates from Firestore (app-specific)
    const unsubscribeAppColors = onSnapshot(
      doc(db, 'apps', appId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          appColors = {
            primary: data.primary || fallbackPrimary,
            secondary: data.secondary || fallbackSecondary,
          };
        } else {
          appColors = { primary: fallbackPrimary, secondary: fallbackSecondary };
        }
        appColorsLoaded = true;
        updateTheme();
      },
      () => {
        // Permission errors or other issues - use fallbacks silently
        appColors = { primary: fallbackPrimary, secondary: fallbackSecondary };
        appColorsLoaded = true;
        updateTheme();
      }
    );

    // Listen to global theme settings from Firestore
    const unsubscribeGlobalTheme = onSnapshot(
      doc(db, 'settings', 'theme'),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          globalTheme = {
            backgroundVariant: (data.backgroundVariant as BackgroundVariant) || 'glow',
            backgroundIntensity: data.backgroundIntensity ?? 0.25,
            backgroundAccentColor: data.backgroundAccentColor || '#f97316',
          };
        } else {
          globalTheme = { backgroundVariant: 'glow', backgroundIntensity: 0.25, backgroundAccentColor: '#f97316' };
        }
        themeLoaded = true;
        updateTheme();
      },
      () => {
        // Permission errors or other issues - use defaults silently
        globalTheme = { backgroundVariant: 'glow', backgroundIntensity: 0.25, backgroundAccentColor: '#f97316' };
        themeLoaded = true;
        updateTheme();
      }
    );

    return () => {
      unsubscribeAppColors();
      unsubscribeGlobalTheme();
    };
  }, [appId, fallbackPrimary, fallbackSecondary]);

  // Apply colors to CSS variables
  useEffect(() => {
    if (!theme.loading) {
      // Set --color-* variables (new standard)
      document.documentElement.style.setProperty('--color-primary', theme.primary);
      document.documentElement.style.setProperty('--color-secondary', theme.secondary);

      // Also set --theme-* variables (for backward compatibility with WorkspaceLayout)
      document.documentElement.style.setProperty('--theme-primary', theme.primary);
      document.documentElement.style.setProperty('--theme-secondary', theme.secondary);
      document.documentElement.style.setProperty('--theme-primary-light', theme.secondary);

      // Also set individual RGB values for use with opacity
      const primaryRgb = hexToRgb(theme.primary);
      const secondaryRgb = hexToRgb(theme.secondary);

      if (primaryRgb) {
        document.documentElement.style.setProperty('--color-primary-rgb', primaryRgb);
        document.documentElement.style.setProperty('--theme-primary-rgb', primaryRgb);
      }
      if (secondaryRgb) {
        document.documentElement.style.setProperty('--color-secondary-rgb', secondaryRgb);
        document.documentElement.style.setProperty('--theme-secondary-rgb', secondaryRgb);
      }
    }
  }, [theme]);

  return (
    <AppColorContext.Provider value={theme}>
      {children}
    </AppColorContext.Provider>
  );
}

// Helper function to convert hex to RGB
function hexToRgb(hex: string): string | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? `${parseInt(result[1], 16)}, ${parseInt(result[2], 16)}, ${parseInt(result[3], 16)}`
    : null;
}
