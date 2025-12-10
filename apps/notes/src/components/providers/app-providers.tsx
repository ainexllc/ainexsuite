"use client";

import { NotesProvider } from "@/components/providers/notes-provider";
import { LabelsProvider } from "@/components/providers/labels-provider";
import { RemindersProvider } from "@/components/providers/reminders-provider";
import { PreferencesProvider } from "@/components/providers/preferences-provider";
import { SpacesProvider } from "@/components/providers/spaces-provider";
import { FilterPresetsProvider } from "@/components/providers/filter-presets-provider";

type AppProvidersProps = {
  children: React.ReactNode;
};

/**
 * App-specific providers for Notes app
 * Note: AuthProvider is handled in layout.tsx as part of the standard nesting:
 * ThemeProvider > AuthProvider > AppColorProvider > AppProviders
 */
export function AppProviders({ children }: AppProvidersProps) {
  return (
    <SpacesProvider>
      <LabelsProvider>
        <PreferencesProvider>
          <FilterPresetsProvider>
            <RemindersProvider>
              <NotesProvider>{children}</NotesProvider>
            </RemindersProvider>
          </FilterPresetsProvider>
        </PreferencesProvider>
      </LabelsProvider>
    </SpacesProvider>
  );
}
