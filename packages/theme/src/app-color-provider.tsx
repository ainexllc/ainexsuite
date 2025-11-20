'use client';

import { createContext, useContext, useEffect, useState, ReactNode } from 'react';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from '@ainexsuite/firebase';

interface AppColors {
  primary: string;
  secondary: string;
  loading: boolean;
}

const AppColorContext = createContext<AppColors>({
  primary: '#3b82f6',
  secondary: '#60a5fa',
  loading: true,
});

export function useAppColors() {
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
  const [colors, setColors] = useState<AppColors>({
    primary: fallbackPrimary,
    secondary: fallbackSecondary,
    loading: true,
  });

  useEffect(() => {
    // Listen to real-time color updates from Firestore
    const unsubscribe = onSnapshot(
      doc(db, 'apps', appId),
      (docSnap) => {
        if (docSnap.exists()) {
          const data = docSnap.data();
          setColors({
            primary: data.primary || fallbackPrimary,
            secondary: data.secondary || fallbackSecondary,
            loading: false,
          });
        } else {
          // Document doesn't exist, use fallbacks (no error)
          setColors({
            primary: fallbackPrimary,
            secondary: fallbackSecondary,
            loading: false,
          });
        }
      },
      (error) => {
        // Permission errors or other issues - use fallbacks silently
        setColors({
          primary: fallbackPrimary,
          secondary: fallbackSecondary,
          loading: false,
        });
      }
    );

    return () => unsubscribe();
  }, [appId, fallbackPrimary, fallbackSecondary]);

  // Apply colors to CSS variables
  useEffect(() => {
    if (!colors.loading) {
      // Set --color-* variables (new standard)
      document.documentElement.style.setProperty('--color-primary', colors.primary);
      document.documentElement.style.setProperty('--color-secondary', colors.secondary);

      // Also set --theme-* variables (for backward compatibility with WorkspaceLayout)
      document.documentElement.style.setProperty('--theme-primary', colors.primary);
      document.documentElement.style.setProperty('--theme-secondary', colors.secondary);
      document.documentElement.style.setProperty('--theme-primary-light', colors.secondary);

      // Also set individual RGB values for use with opacity
      const primaryRgb = hexToRgb(colors.primary);
      const secondaryRgb = hexToRgb(colors.secondary);

      if (primaryRgb) {
        document.documentElement.style.setProperty('--color-primary-rgb', primaryRgb);
        document.documentElement.style.setProperty('--theme-primary-rgb', primaryRgb);
      }
      if (secondaryRgb) {
        document.documentElement.style.setProperty('--color-secondary-rgb', secondaryRgb);
        document.documentElement.style.setProperty('--theme-secondary-rgb', secondaryRgb);
      }
    }
  }, [colors]);

  return (
    <AppColorContext.Provider value={colors}>
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
