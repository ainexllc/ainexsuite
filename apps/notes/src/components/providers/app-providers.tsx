"use client";

import { CoversProvider } from "@/components/providers/covers-provider";

type AppProvidersProps = {
  children: React.ReactNode;
};

/**
 * App-specific providers for Notes app (non-auth-dependent only)
 *
 * IMPORTANT: Auth-dependent providers must NOT be in the root layout.
 * They are handled in workspace/layout.tsx after auth is confirmed.
 *
 * Provider hierarchy:
 * - Root layout: ThemeProvider > AuthProvider > AppColorProvider > AppProviders
 * - Workspace layout: SpacesProvider > LabelsProvider > PreferencesProvider > etc.
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <CoversProvider>
      {children}
    </CoversProvider>
  );
}
