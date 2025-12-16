"use client";

import { SpacesProvider } from "@/components/providers/spaces-provider";
import { HabitsProvider } from "@/components/providers/habits-provider";

type AppProvidersProps = {
  children: React.ReactNode;
};

/**
 * App-specific providers for Grow app
 * Note: AuthProvider is handled in layout.tsx as part of the standard nesting:
 * ThemeProvider > AuthProvider > AppColorProvider > AppProviders
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SpacesProvider>
      <HabitsProvider>{children}</HabitsProvider>
    </SpacesProvider>
  );
}
