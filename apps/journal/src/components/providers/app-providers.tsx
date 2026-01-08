"use client";

import { SpacesProvider } from "@/components/providers/spaces-provider";
import { PreferencesProvider } from "@/components/providers/preferences-provider";
import { CoverSettingsProvider } from "@/contexts/cover-settings-context";

type AppProvidersProps = {
  children: React.ReactNode;
};

/**
 * App-specific providers for Journal app
 * Note: AuthProvider is handled in layout.tsx as part of the standard nesting:
 * ThemeProvider > AuthProvider > AppColorProvider > AppProviders
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SpacesProvider>
      <PreferencesProvider>
        <CoverSettingsProvider>
          {children}
        </CoverSettingsProvider>
      </PreferencesProvider>
    </SpacesProvider>
  );
}
